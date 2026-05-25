const pool = require('../config/database');

// @desc    Get all users with search and filters
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
    try {
        const { search, role, verified } = req.query;
        let query = 'SELECT id, full_name, email, role, is_verified, created_at FROM users WHERE 1=1'; //trick to add AND opeartor in later on  query
        const params = []; // Array to hold query parameters like ($1,$2,...)

        if (search) {
            params.push(`%${search}%`);
            query += ` AND (full_name ILIKE $${params.length} OR email ILIKE $${params.length})`;
        }

        if (role) {
            params.push(role);
            query += ` AND role = $${params.length}`;
        }

        // /api/users?verified=true (only veriify uers )
        // /api/users?verified=false (only unverified users)
        // /api/users= (all users)

        if (verified !== undefined && verified !== '') {
            params.push(verified === 'true');
            query += ` AND is_verified = $${params.length}`;
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('getUsers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
    try {
        const { full_name, role, is_verified } = req.body;
        const { id } = req.params;

        const result = await pool.query(
            'UPDATE users SET full_name = COALESCE($1, full_name), role = COALESCE($2, role), is_verified = COALESCE($3, is_verified), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
            [full_name, role, is_verified, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('updateUser error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("User Id:",  id)
        console.log("Req Params:", req.params)

        // Prevent admin from deleting themselves 
        // params.id === user id
        // req.params.id=== currently logged in admin id 
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own admin account'
            });
        }

        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('deleteUser error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
