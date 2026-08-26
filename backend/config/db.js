// Mock DB to bypass sqlite3 native build issues on Windows during demo
module.exports = {
    query: async (text, params) => {
        console.log('Mock DB Query:', text, params);
        return { rows: [], rowCount: 0 };
    },
    db: {}
};
