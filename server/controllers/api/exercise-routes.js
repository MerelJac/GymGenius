const router = require('express').Router();
const { Exercise } = require('../../models')


// TODO - add user foreign keys

// get all 
router.get('/', async (req, res) => {
    try {
        const posts = await Exercise.find({})
        console.log(posts);
        res.status(200).send(posts)
    } catch (err) {
        console.error(err)
        res.json({ message: 'An error has occured' })
    }
})

//create exercise 
router.post('/', async (req, res) => {
    let body = req.body;
    console.log(body)
    try {
        const newExercise = await Exercise.create(body)
        res.json(newExercise)
    } catch (err) {
        console.error({message: `you have an error: ${err}`})
        throw err
    }
})

// find exercise by name
router.post('/:title', async (req, res) => {
    try{
    const exerciseName = req.params.title
    const exercise = await Exercise.findOne({search_name: exerciseName});
    if (exercise) {
        res.json({message: 'Yes', exercise})
    } else {
        res.json({message: 'No'})
    }
    } catch (err) {
        console.error(err)
        res.json({ message: 'There is an error'})
    }
})

// update 1RM by ID
router.put('/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const updateRepMax = req.body.update1RM; 
  
      const updatedExercise = await Exercise.findOneAndUpdate(
        { _id: id },
        { $set: { one_rep_max: updateRepMax } },
        { new: true } // To get the updated document
      );
  
      if (updatedExercise) {
        res.json({ message: 'Updated exercise', exercise: updatedExercise });
      } else {
        res.status(404).json({ message: 'Exercise not found' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'There is an error' });
    }
  });
  
module.exports = router;