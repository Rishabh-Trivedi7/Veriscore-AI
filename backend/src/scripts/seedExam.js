import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Exam } from '../models/exam.model.js';
import { User } from '../models/user.model.js';

dotenv.config();

const seedExam = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create admin user if not exists
    const adminExists = await User.findOne({ role: 'Admin' });
    if (!adminExists) {
      const admin = await User.create({
        username: 'admin',
        email: 'admin@veriscore.ai',
        password: 'admin123',
        role: 'Admin',
        fullName: 'System Administrator',
      });
      console.log('✅ Admin user created:', admin.username);
    }

    // Create sample exam
    const examExists = await Exam.findOne({ title: 'Full Stack Development Assessment' });
    if (!examExists) {
      const exam = await Exam.create({
        title: 'Full Stack Development Assessment',
        description: 'Comprehensive assessment covering frontend, backend, and database concepts',
        questions: [
          {
            questionText: 'Explain the difference between REST and GraphQL APIs. When would you choose one over the other?',
            questionType: 'descriptive',
            correctAnswer: 'REST is a stateless architectural style using standard HTTP methods, while GraphQL is a query language that allows clients to request exactly the data they need. REST is better for simple CRUD operations and caching, while GraphQL is better for complex data requirements and reducing over-fetching.',
            points: 10,
          },
          {
            questionText: 'What is the purpose of middleware in Express.js? Provide an example of a custom middleware function.',
            questionType: 'descriptive',
            correctAnswer: 'Middleware functions have access to request, response, and next objects. They can execute code, modify request/response, end the request-response cycle, or call the next middleware. Example: authentication middleware that checks JWT tokens.',
            points: 10,
          },
          {
            questionText: 'Describe the concept of "state" in React. How does useState hook work?',
            questionType: 'descriptive',
            correctAnswer: 'State is data that can change over time and affects component rendering. useState is a hook that returns an array with the current state value and a function to update it. When state updates, React re-renders the component.',
            points: 10,
          },
          {
            questionText: 'What are MongoDB indexes and why are they important for database performance?',
            questionType: 'descriptive',
            correctAnswer: 'Indexes are data structures that improve query performance by allowing MongoDB to find documents without scanning the entire collection. They are crucial for large collections and frequently queried fields.',
            points: 10,
          },
          {
            questionText: 'Explain the difference between authentication and authorization in web applications.',
            questionType: 'descriptive',
            correctAnswer: 'Authentication verifies who a user is (login process), while authorization determines what resources and actions a user can access based on their role or permissions.',
            points: 10,
          },
        ],
        passingScore: 60,
        duration: 60, // 60 minutes
        isActive: true,
      });
      console.log('✅ Sample exam created:', exam.title);
    } else {
      console.log('ℹ️  Exam already exists');
    }

    console.log('✅ Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedExam();
