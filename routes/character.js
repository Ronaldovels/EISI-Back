const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const characterSchema = new mongoose.Schema({
    name: String,
    gender: String,
    filiation: String,
    race: String,
    hair_color: String,
    eye_color: String,
    introducion_arc: String,
    family: String,
    techniques: String,
    characterImg: String
})

const Character = mongoose.model('Character', characterSchema)

const getDailyCharacter = async () => {
    try {
      const count = await Character.countDocuments();
      if (count === 0) {
        throw new Error('Nenhum personagem encontrado no banco de dados');
      }
  
      // Obtenha o tempo atual em milissegundos desde 1970
      const now = new Date().getTime();
  
      // Calcule o índice do personagem com base no tempo atual dividido por 3 minutos (em milissegundos)
      const threeMinutesInMs = 3 * 60 * 1000; // 3 minutos em milissegundos
      const characterIndex = Math.floor(now / threeMinutesInMs) % count;
  
      // Seleciona o personagem baseado no índice calculado
      const character = await Character.findOne().skip(characterIndex);
  
      return character;
    } catch (error) {
      console.error('Erro ao buscar o personagem do dia:', error);
      throw error;
    }
  };
  


// Rota no backend
router.get('/daily', async (req, res) => {
    try {
      const character = await getDailyCharacter();
      res.json(character);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch daily character' });
    }
  });
  


router.get('/', async (req, res) => {
    try {
        const { name, exactMatch, gender, filiation, race, hair_color, eye_color, introducion_arc, family, techniques } = req.query;
        const filter = {};

        if (name) {
            const names = name.split(',');
            if (exactMatch === 'true') {
                // Busca por nomes exatos
                filter.name = { $in: names.map((name) => new RegExp(`^${name}$`, 'i')) };
            } else {
                // Busca por nomes parciais (para sugestões)
                filter.name = { $in: names.map((name) => new RegExp(name, 'i')) };
            }
        }
        if (gender) filter.gender = gender;
        if (filiation) {
            const filiations = filiation.split(',');
            filter.filiation = { $in: filiations.map((filiation) => new RegExp(filiation, 'i')) };
        }
        if (race) filter.race = race;
        if (hair_color) filter.hair_color = hair_color;
        if (eye_color) filter.eye_color = eye_color;
        if (introducion_arc) filter.introducion_arc = introducion_arc;
        if (family) filter.family = family;
        if (techniques) filter.techniques = techniques;

        const characters = await Character.find(filter);
        res.send(characters);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch records' });
    }
});


// Rota para criar múltiplos personagens
router.post('/', async (req, res) => {
    try {
        const charactersData = req.body;

        // Verifica se é um array e se contém pelo menos um item
        if (!Array.isArray(charactersData) || charactersData.length === 0) {
            return res.status(400).json({ error: 'Envie um array de personagens' });
        }

        // Insere todos os personagens de uma vez usando insertMany
        const newCharacters = await Character.insertMany(charactersData);

        res.status(201).json(newCharacters);
    } catch (error) {
        console.error('Erro ao criar personagens:', error);
        res.status(400).json({ error: 'Failed to create characters' });
    }
});


router.patch('/:id', async (req, res) => {
    const id = req.params.id

    try {
        const updateCharacter = await Character.findByIdAndUpdate(id,
            {
                name: req.body.name,
                gender: req.body.gender,
                filiation: req.body.filiation,
                race: req.body.race,
                hair_color: req.body.hair_color,
                eye_color: req.body.eye_color,
                introducion_arc: req.body.introducion_arc,
                family: req.body.family,
                techniques: req.body.techniques,
                characterImg: req.body.characterImg
            },
            {
                new: true,
                runValidators: true
            }
        )
        if (!updateCharacter) {
            return res.status(404).json({error: 'Character not found'})
        }
        res.json(updateCharacter)
    } catch (error) {
        res.status(400).json({error: "Can't update character"})
    }

})

module.exports = router