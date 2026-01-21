

import connectDb from '../../../../lib/db';  // Import DB connection utility
import ActiveUser from '../../../../models/ActiveUser';  // Import the ActiveUser model
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { collageName } = req.query;  // Get collageName from the URL query

  // Establish DB connection if not already connected
  if (!mongoose.connections[0].readyState) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  // Connect to the database middleware
  await connectDb();

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      // GET: Fetch active users by collageName
      try {
        const users = await ActiveUser.find({ collageName });

        if (users.length === 0) {
          return res.status(404).json({ message: 'No active users found for this company' });
        }

        return res.status(200).json(users);  // Respond with the found users
      } catch (err) {
        return res.status(500).json({ message: 'Error fetching active users', error: err.message });
      }

    case 'POST':
      // POST: Create a new active user or increment the isActive value
      const { isActive, collageName: collageToCreate } = req.body;

      if (!collageToCreate || isActive === undefined) {
        return res.status(400).json({ message: 'Both collageName and isActive are required' });
      }

      try {
        // Check if the active user already exists for the given collageName
        const existingUser = await ActiveUser.findOne({ collageName: collageToCreate });

        if (existingUser) {
          // If the company exists, increment the isActive value by 1
          existingUser.isActive += isActive;  // Increment isActive by the provided value
          await existingUser.save();
          return res.status(200).json({ message: 'Company updated successfully with incremented isActive', existingUser });
        }

        // Create a new active user if it doesn't exist for the company
        const newUser = new ActiveUser({ isActive, collageName: collageToCreate });
        await newUser.save();

        return res.status(201).json({ message: 'Active user created successfully', newUser });
      } catch (err) {
        return res.status(500).json({ message: 'Error creating or updating active user', error: err.message });
      }

    case 'PUT':
      // PUT: Update the active user's status by collageName
      const { isActive: newIsActive, collageName: collageToUpdate } = req.body;

      if (newIsActive === undefined || !collageToUpdate) {
        return res.status(400).json({ message: 'Both collageName and newIsActive are required' });
      }

      try {
        // Check if the company exists and update its isActive value
        const updatedUser = await ActiveUser.findOneAndUpdate(
          { collageName: collageToUpdate },  // Find by collageName
          { $set: { isActive: newIsActive } },  // Update the isActive field
          { new: true }
        );

        if (!updatedUser) {
          return res.status(404).json({ message: 'User not found for this company' });
        }

        return res.status(200).json({ message: 'User updated successfully', updatedUser });
      } catch (err) {
        return res.status(500).json({ message: 'Error updating active user', error: err.message });
      }

    default:
      // Handle unsupported HTTP methods
      return res.status(405).json({ message: 'Method not allowed' });
  }
}
