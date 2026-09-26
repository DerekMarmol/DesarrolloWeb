import { DataTypes } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export const Curso = sequelize.define('curso', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: { msg: 'El nombre es obligatorio' } },
  },
  codigo_unico: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,                       
    validate: { notEmpty: { msg: 'El código único es obligatorio' } },
  },
  creditos: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'cursos',
});