const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// GET request to find all products
router.get('/', (req, res) => {
  Product.findAll({
    include: [
      Category,
      {
        model: Tag,
        through: ProductTag,
      },
    ],
  })
    .then((products) => res.json(products))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// GET request to retrieve on product by `id`
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = await Product.findByPk(productId, {
      include: [
        {
          model: Category,
          attributes: ['id', 'category_name'], 
        },
        {
          model: Tag,
          attributes: ['id', 'tag_name'],
          through: {
            model: ProductTag,
            attributes: [],
          },
        },
      ],
    });
    if (!productData) {
      return res.status(404).json({ message: 'Product not found. '});
    }
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error. '});
  }
});

// POST request to create a new product
router.post('/', (req, res) => {
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// PUT request to update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {

        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
            .filter((tag_id) => !productTagIds.includes(tag_id))
            .map((tag_id) => {
              return {
                product_id: req.params.id,
                tag_id,
              };
            });

          // figure out which ones to remove
          const productTagsToRemove = productTags
            .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
            .map(({ id }) => id);
          // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json({ message: 'Product updated successfully.'});
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

// Delete request to delete a product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteProduct = await Product.destroy({
      where: {
        id: id
      }
    });
    if (deleteProduct) {
      res.status(200).json({ message: 'Product deleted successfully. '});
    } else {
      res.status(404).json({ message: 'Product not found.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Internal server error. '});
  }
  // delete one product by its `id` value
});

module.exports = router;
