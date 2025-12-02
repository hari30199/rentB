const AdminRoute = require('./Admin')

module.exports = (app) => {
    app.use('/rentb/admin', AdminRoute)
}
