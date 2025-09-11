export const getStatus = async (req, res) => {
  res.status(200).json({ status: "OK", message: "Backend service is running" });
};

export default { getStatus };