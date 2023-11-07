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

// delete program by id
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deleteProgram = await Programs.findOneAndDelete({ program_id: id });

    if (!deleteProgram) {
      return res.status(404).json({ message: "Program not found." });
    }
    res.status(200).json({ message: "Program deleted successfully." });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the program." });
  }
});


module.exports = router;
