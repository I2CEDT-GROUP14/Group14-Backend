export const getStatus = async (req, res) => {
  res.status(200).json({ status: "OK", message: "Service is running" });
};

export default { getStatus };