const router = require("express").Router();

const { Programs } = require("../../models");

// get all programs
router.get("/", async (req, res) => {
  const allPrograms = await Programs.find({});
  res.json(allPrograms);
});

// get program by id
router.post("/:id", async (req, res) => {
  try {
    const programId = req.params.id;
    const findProgramById = await Programs.findOne({ program_id: programId})

    if (!findProgramById) {
        return res.status(404).json({ message: 'Program not found' });
      }
  
      res.status(200).json({ message: 'Program found', data: findProgramById });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
