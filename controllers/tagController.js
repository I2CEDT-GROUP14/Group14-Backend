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
export default { getAllTags };