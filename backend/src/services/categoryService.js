import { Category } from '../models/Category.js'
import { AppError } from '../middleware/errors.js'

function publicCategory(category) {
  return {
    id: category._id.toString(),
    name: category.name,
    icon: category.icon,
    color: category.color,
    isSystem: category.isSystem,
    isArchived: category.isArchived,
  }
}

export function createCategoryService({ categoryModel = Category } = {}) {
  return {
    async list(userId) {
      const categories = await categoryModel.find({
        isArchived: false,
        $or: [{ userId }, { isSystem: true }],
      }).sort({ name: 1 }).lean()
      return categories.map(publicCategory)
    },

    async create(userId, payload) {
      try {
        const category = await categoryModel.create({ ...payload, userId })
        return publicCategory(category)
      } catch (error) {
        if (error?.code === 11000) {
          throw new AppError(409, 'CATEGORY_ALREADY_EXISTS', 'A category with this name already exists.')
        }
        throw error
      }
    },

    async update(userId, id, payload) {
      try {
        const category = await categoryModel.findOneAndUpdate(
          { _id: id, userId, isSystem: false, isArchived: false },
          { $set: payload },
          { new: true, runValidators: true },
        ).lean()
        if (!category) throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Category was not found.')
        return publicCategory(category)
      } catch (error) {
        if (error?.code === 11000) {
          throw new AppError(409, 'CATEGORY_ALREADY_EXISTS', 'A category with this name already exists.')
        }
        throw error
      }
    },

    async archive(userId, id) {
      const result = await categoryModel.updateOne(
        { _id: id, userId, isSystem: false, isArchived: false },
        { $set: { isArchived: true } },
      )
      if (!result.matchedCount) throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Category was not found.')
    },
  }
}
