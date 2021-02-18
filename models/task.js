'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.task.belongsTo(models.user)
      models.task.hasOne(models.detail, { 
        foreignKey: 'taskId', 
        as: 'detail', 
        onDelete: 'CASCADE' 
      });
      models.task.belongsToMany(models.category, {through:"tasksCategories"})
    }
  };
  task.init({
    title: DataTypes.STRING,
    carbon: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'task',
  });
  return task;
};