import Task from '../model/taskModel.js';

//create a new task
export const createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, completed } = req.body;
        if (!title || !priority || !dueDate) {
            return res.status(400).json({success: false, message: "Title, priority, and dueDate are required."});
        }
        const newTask = new Task({
            title,
            description,
            priority,
            dueDate,
            completed : completed === "Yes" || completed === true, // Convert "Yes" to true, anything else to false
            owner: req.user.id
        });
        const saved = await newTask.save();
        res.status(201).json({
            success: true,
            task: saved
        });
    }
    catch (error) {
        res.status(400).json({success: false, message:  error.message});
    }
}


//get all tasks
export const getTasks = async (req, res) =>{
    try{
        const tasks = await Task.find({ owner: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            tasks
        });
    }
    catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
}

//get a single task by id must belong to a user
export const getTaskById = async (req, res) =>{
    try{
        const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({
            success: true,
            task
        });
    }
    catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
}

//update a task by id must belong to a user
/* export const updateTask = async (req, res) =>{
    try{
        const data = {...req.body};
        if (data.completed !== undefined) {
            data.completed = data.completed === "Yes" || data.completed === true; // Convert "Yes" to true, anything else to false
        }

        const updated = await Task.findOneAndUpdate(
            { _id: req.params.id, owner: req.user.id },
            data,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({
            success: true,
            task: updated
        });
    }
    catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
} */

    export const updateTask = async (req, res) => {
  const { id } = req.params;
  const updated = await Task.findByIdAndUpdate(id, req.body, { new: true });
  if (!updated) return res.status(404).json({ success: false, message: "Task not found" });
  res.json({ success: true, task: updated });
};

//delete a task by id must belong to a user
export const deleteTask = async (req, res) =>{
    try{
        const deleted = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
}