import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    return { accessToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role, fullName } = req.body;

  const profilePictureFile = req.files?.profilePicture?.[0];
  const resumeFile = req.files?.resume?.[0];

  if ([username, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    role: role || "Candidate",
    fullName,
    profilePicture: profilePictureFile ? `/uploads/${profilePictureFile.filename}` : "",
    resume: resumeFile ? `/uploads/${resumeFile.filename}` : "",
  });

  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  const { accessToken } = await generateAccessAndRefreshTokens(user._id);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(200, { user: createdUser, accessToken }, "User registered successfully")
    );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!(username || email) && !password) {
    throw new ApiError(400, "Username/Email and password are required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken },
        "User logged in successfully"
      )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    };
    if (req.user?._id) {
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { tokenVersion: 1 }
        });
    }
  return res
    .status(200)
    .clearCookie("accessToken",options)
    .header("Clear-Site-Data", '"cookies", "storage"')
    .header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    .header("Pragma", "no-cache")
    .header("Expires", "0")
    .json(new ApiResponse(200, {}, "User logged out"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const { username, email, fullName } = req.body;
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (username) user.username = username.toLowerCase();
  if (email) user.email = email.toLowerCase();
  if (fullName) user.fullName = fullName;

  if (req.files?.profilePicture) {
    user.profilePicture = `/uploads/${req.files.profilePicture[0].filename}`;
  }

  if (req.files?.resume) {
    user.resume = `/uploads/${req.files.resume[0].filename}`;
  }

  await user.save();

  const updatedUser = await User.findById(user._id).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});
