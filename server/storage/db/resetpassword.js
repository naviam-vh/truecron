/**
 * Created by Andrew on 05.02.2015.
 */
module.exports = function(sequelize, DataTypes) {

    var ResetPassword = sequelize.define('ResetPassword', {
        email:    {
            type: DataTypes.STRING(256), allowNull: false,
            set: function (value) {
                this.setDataValue('email', value.toString().toLowerCase());
            }
        },
        resetpasswordcode:   { type: DataTypes.STRING(1024), allowNull: false }
    }, {
        schema: 'tc',
        tableName: 'resetpassword',
        timestamps: true,
        freezeTableName: true,
        classMethods: {
            //associate: function(models) {
            //}
        }
    });

    return ResetPassword;
};