const ExcelJS = require('exceljs');

const exportToExcel = async (excelData, name, colWidths, res) => {
    // Set response headers first
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${name}.xlsx"`);

    try {
        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(name);

        // If columns widths provided, set them
        if (colWidths && Array.isArray(colWidths)) {
            worksheet.columns = excelData.length
                ? Object.keys(excelData[0]).map((key, i) => ({
                    header: key,
                    key,
                    width: colWidths[i]?.wch || 20,
                }))
                : [];
        } else if (excelData.length) {
            worksheet.columns = Object.keys(excelData[0]).map((key) => ({
                header: key,
                key,
                width: 20,
            }));
        }

        // Add rows
        worksheet.addRows(excelData);

        // Optional styling: make header bold
        worksheet.getRow(1).font = { bold: true };

        // Write to response and end
        await workbook.xlsx.write(res);
        return true;
    } catch (err) {
        console.error('Excel export failed:', err);
        // Only send error if headers haven't been sent
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Failed to generate Excel file',
                error: err.message
            });
        }
        return false;
    }
};

module.exports = { exportToExcel };
