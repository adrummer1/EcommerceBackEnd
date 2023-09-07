const router = require('express').Router();
const e = require('express');
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

// GET request to retrieve all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Product }],
    });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET request to return one category by `id`
router.get('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const categoryData = await Category.findByPk(categoryId, {
      include: [{ model: Product }],
    });
    if (categoryData) {
      res.status(200).json(categoryData);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST request to add a new category
router.post('/', async (req, res) => {
  try {
    const { category_name } = req.body;
    const newCategory = await Category.create({ category_name });
    res.status(200).json(newCategory);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT request to update category by `id`
router.put('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { category_name } = req.body;
    const updatedCategory = await Category.update(
      { category_name },
      { where: { id: categoryId }}
    );
    if (updatedCategory[0] === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    return res.status(200).json({ message: 'Category updated successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE request to delete a category
router.delete('/:id', (req, res) => {
  Category.destroy({
      where: {
        id: req.params.id,
      },
    })
      .then((category) => res.status(200).json({ message: 'Category deleted successfully.' }))
      .catch((category) => res.status(400).json(err));
  });

module.exports = router;
