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

export default { getAllTags, createTag };