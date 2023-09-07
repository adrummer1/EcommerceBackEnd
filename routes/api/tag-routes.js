const router = require("express").Router();
const { Tag, Product, ProductTag } = require("../../models");

// The `/api/tags` endpoint

// GET request to retrieve all tags
router.get("/", (req, res) => {
  Tag.findAll({
    include: [
      {
        model: Product,
        through: ProductTag,
      },
    ],
  })
    .then((tags) => res.status(200).json(tags))
    .catch((err) => res.status(500).json(err));
});

// GET request to retrieve a single tag by `id`
router.get("/:id", async (req, res) => {
  try {
    const tagId = req.params.id;
    const tag = await Tag.findByPk(tagId, {
      include: [
        {
          model: Product,
          through: ProductTag,
          as: "products",
        },
      ],
    });
    if (tag) {
      res.status(200).json(tag);
    } else {
      res.status(404).json({ message: "Tag not found" });
    }
  } catch (err) {
    res.status(err).json({ message: "Internal server error" });
  }
});

// POST request that creates a new tag
router.post("/", async (req, res) => {
  try {
    const { tag_name } = req.body;
    const newTag = await Tag.create({ tag_name });
    res.status(200).json(newTag);
  } catch (err) {
    res.status(500).json({ message: "Internal server error. " });
  }
});

// PUT request to update a tag
router.put("/:id", async (req, res) => {
  try {
    const tagId = req.params.id;
    const { tag_name } = req.body;
    const updatedTag = await Tag.update(
      { tag_name },
      { where: { id: req.params.id } }
    );
    if (updatedTag[0] === 0) {
      res.status(404).json({ message: "Tag not found" });
    }
    return res.status(200).json({ message: "Tag updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Internal server error. " });
  }
});

// DELETE request to delete tag by `id`
router.delete('/:id', async (req, res) => {
  try {
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!tagData) {
      res.status(404).json({ message: 'No tag with this id was found.' });
      return;
    }
    res.status(200).json({ message: 'Tag deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
