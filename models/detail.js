'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.detail.belongsTo(models.task)
    }
  };
  detail.init({
    activity: DataTypes.INTEGER,
    activityType: DataTypes.STRING,
    country: DataTypes.STRING,
    mode: DataTypes.STRING,
    taskId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'detail',
  });
  return detail;
};