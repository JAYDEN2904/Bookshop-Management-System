import { Router } from 'express';
import Student from '../models/Student';

const router = Router();

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort('-createdAt');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error });
  }
});

// Add new student
router.post('/', async (req, res) => {
  try {
    const { name, class_level } = req.body;
    const student = new Student({ name, class_level });
    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating student', error });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, class_level } = req.body;

    const student = await Student.findByIdAndUpdate(
      id,
      { name, class_level },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error updating student', error });
  }
});

export default router; 