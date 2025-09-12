import dotenv from 'dotenv';
import Tag from '../models/tagModel.js';
dotenv.config();

export const getAllTags = async (req, res) => {
    try {
        const tags = await Tag.find();
        res.status(200).json(tags);
    } catch (error) {
        console.error("Error fetching tags:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const createTag = async (req, res) => {
    try {
        //check if tag with same name exists
        const existingTag = await Tag.findOne({ name: req.body.name });
        if (existingTag) {
            return res.status(400).json({ error: "Tag with this name already exists" });
        }
        const { name } = req.body;
        const newTag = new Tag({ name });
        await newTag.save();
        res.status(201).json(newTag);
    } catch (error) {
        console.error("Error creating tag:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const deleteTag = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedTag = await Tag.findByIdAndDelete(id);
        if (!deletedTag) {
            return res.status(404).json({ error: "Tag not found" });
        }
        res.status(200).json({ message: "Tag deleted successfully" });
    } catch (error) {
        console.error("Error deleting tag:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export default { getAllTags, createTag };