/** ***************************************
 * 建檔人員: Paul
 * 建檔日期: 2017/8/11
 * 功能說明: 匯出作業 支援(csv,xls,xlsx,doc,pdf(分頁可能有問題，要用時我再補好),txt,png)
 * 版本: 0.1
 *****************************************/
// script load
// export xls, xlsx extension http://sheetjs.com/demos/table.html
import 'script-loader!xlsx/dist/xlsx.core.min';
// export excel 2003
import 'script-loader!file-saver/FileSaver.min';
// export pdf use
import 'script-loader!jspdf/dist/jspdf.min';
// 解決亂碼問題 http://mike-zheng.github.io/2017/02/12/學習筆記-front-end生成pdf/
import 'script-loader!html2canvas/dist/html2canvas';

    // prototype
    $.fn.extend({
        tableExport(options) {
            let defaults = {
                consoleLog: false, // debug use
                csvEnclosure: '"',  // csv not use
                csvSeparator: ',',  // csv not use
                csvUseBOM: true,
                displayTableName: false,
                escape: false,  // 溢出字元
                excelFileFormat: 'xlshtml', // excel 2003 use
                excelstyles: [],            // e.g. ['border-bottom', 'border-top', 'border-left', 'border-right'] excel 2003 use
                fileName: 'tableExport',    // 預設檔
                htmlContent: false, // html input
                ignoreColumn: [],
                ignoreRow: [],
                jsonScope: 'all',
                numbers: {
                    html: {
                        decimalMark: '.',
                        thousandsSeparator: ','
                    },
                    output:
                        {
                            decimalMark: '.',
                            thousandsSeparator: ','
                        }
                },
                onCellData: null,
                onCellHtmlData: null,
                onMsoNumberFormat: null,
                outputMode: 'file',
                tbodySelector: 'tr',    // 如果是橫式的請改th
                tfootSelector: 'tr',
                theadSelector: 'tr',
                tableName: 'myTableName', // excel
                type: 'xlsx',
                worksheetName: 'Worksheet' // worksheetName
            };
            // 上方為預設值 -----------------------------------

            let FONT_ROW_RATIO = 1.15;
            let el = this;
            let DownloadEvt = null;
            let $hrows = [];
            let $rows = [];
            let rowIndex = 0;
            let rowspans = [];
            let trData = '';
            let colNames = [];
            let blob;

            $.extend(true, defaults, options);

            colNames = GetColumnNames(el);

            if (defaults.type === 'csv' || defaults.type === 'tsv' || defaults.type === 'txt') {

                let csvData = '';
                let rowlength = 0;
                rowIndex = 0;

                function csvString(cell, rowIndex, colIndex) {
                    let result = '';

                    if (cell !== null) {
                        let dataString = parseString(cell, rowIndex, colIndex);

                        let csvValue = (dataString === null || dataString === '') ? '' : dataString.toString();

                        if (defaults.type === 'tsv') {
                            if (dataString instanceof Date) {
                                result = dataString.toLocaleString();
                            }

                            // http://www.iana.org/assignments/media-types/text/tab-separated-values
                            result = replaceAll(csvValue, '\t', ' ');
                        } else if (dataString instanceof Date) {
                            result = defaults.csvEnclosure + dataString.toLocaleString() + defaults.csvEnclosure;
                        } else {
                            result = replaceAll(csvValue, defaults.csvEnclosure, defaults.csvEnclosure + defaults.csvEnclosure);

                            if (result.indexOf(defaults.csvSeparator) >= 0 || /[\r\n ]/g.test(result)) {
                                result = defaults.csvEnclosure + result + defaults.csvEnclosure;
                            }
                        }
                    }

                    return result;
                }

                let CollectCsvData = function ($rows, rowselector, length) {

                    $rows.each(function () {
                        trData = '';
                        ForEachVisibleCell(this, rowselector, rowIndex, length + $rows.length,
                            function (cell, row, col) {
                                trData += csvString(cell, row, col) + (defaults.type === 'tsv' ? '\t' : defaults.csvSeparator);
                            });
                        trData = $.trim(trData).substring(0, trData.length - 1);
                        if (trData.length > 0) {

                            if (csvData.length > 0) {
                                csvData += '\n';
                            }

                            csvData += trData;
                        }
                        rowIndex++;
                    });

                    return $rows.length;
                };

                rowlength += CollectCsvData($(el).find('thead').first().find(defaults.theadSelector), 'th,td', rowlength);
                $(el).find('tbody').each(function () {
                    rowlength += CollectCsvData($(this).find(defaults.tbodySelector), 'td,th', rowlength);
                });
                if (defaults.tfootSelector.length) {
                    CollectCsvData($(el).find('tfoot').first().find(defaults.tfootSelector), 'td,th', rowlength);
                }

                csvData += '\n';

                // output
                if (defaults.consoleLog === true) {
                    console.log(csvData);
                }

                if (defaults.outputMode === 'string') {
                    return csvData;
                }

                if (defaults.outputMode === 'base64') {
                    return base64encode(csvData);
                }

                if (defaults.outputMode === 'window') {
                    downloadFile(false, 'data:text/' + (defaults.type === 'csv' ? 'csv' : 'plain') + ';charset=utf-8,', csvData);
                    return;
                }

                try {
                    blob = new Blob([csvData], {type: 'text/' + (defaults.type === 'csv' ? 'csv' : 'plain') + ';charset=utf-8'});
                    saveAs(blob, defaults.fileName + '.' + defaults.type, (defaults.type !== 'csv' || defaults.csvUseBOM === false));
                } catch (e) {
                    downloadFile(defaults.fileName + '.' + defaults.type,
                        'data:text/' + (defaults.type === 'csv' ? 'csv' : 'plain') + ';charset=utf-8,' + ((defaults.type === 'csv' && defaults.csvUseBOM) ? '\ufeff' : ''),
                        csvData);
                }

            } else if (defaults.type === 'excel' && defaults.excelFileFormat === 'xmlss') {
                var $tables = $(el).filter(function () {
                    return $(this).data('tableexport-display') !== 'none' &&
                        ($(this).is(':visible') ||
                            $(this).data('tableexport-display') === 'always');
                });
                let docDatas = [];
                $tables.each(function () {
                    let $table = $(this);
                    let docData = '';
                    rowIndex = 0;
                    colNames = GetColumnNames(this);
                    $hrows = $table.find('thead').first().find(defaults.theadSelector);
                    docData += '<Table>';

                    // Header
                    let cols = 0;
                    $hrows.each(function () {
                        trData = '';
                        ForEachVisibleCell(this, 'th,td', rowIndex, $hrows.length,
                            function (cell, row, col) {
                                if (cell !== null) {
                                    trData += '<Cell><Data ss:Type="String">' + parseString(cell, row, col) + '</Data></Cell>';
                                    cols++;
                                }
                            });
                        if (trData.length > 0) {
                            docData += '<Row>' + trData + '</Row>';
                        }
                        rowIndex++;
                    });

                    // Row Vs Column, support multiple tbodys
                    $rows = [];
                    $table.find('tbody').each(function () {
                        $rows.push(...$(this).find(defaults.tbodySelector));
                    });

                    // if (defaults.tfootSelector.length)
                    //    $rows.push.apply($rows, $table.find('tfoot').find(defaults.tfootSelector));

                    $($rows).each(function () {
                        let $row = $(this);
                        trData = '';
                        ForEachVisibleCell(this, 'td,th', rowIndex, $hrows.length + $rows.length,
                            function (cell, row, col) {
                                if (cell !== null) {
                                    let type = 'String';
                                    let style = '';
                                    let data = parseString(cell, row, col);

                                    if (jQuery.isNumeric(data) !== false) {
                                        type = 'Number';
                                    } else {
                                        number = parsePercent(data);
                                        if (number !== false) {
                                            data = number;
                                            type = 'Number';
                                            style = ' ss:StyleID="pct1"';
                                        }
                                    }

                                    if (type !== 'Number') {
                                        data = data.replace(/\n/g, '<br>');
                                    }

                                    trData += '<Cell' + style + '><Data ss:Type="' + type + '">' + data + '</Data></Cell>';
                                }
                            });
                        if (trData.length > 0) {
                            docData += '<Row>' + trData + '</Row>';
                        }
                        rowIndex++;
                    });

                    docData += '</Table>';
                    docDatas.push(docData);

                    if (defaults.consoleLog === true) {
                        console.log(docData);
                    }
                });

                let CreationDate = new Date().toISOString();
                var docFile = '<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?> ' +
                    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ' +
                    'xmlns:o="urn:schemas-microsoft-com:office:office" ' +
                    'xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
                    'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ' +
                    'xmlns:html="http://www.w3.org/TR/REC-html40"> ' +
                    '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"> ' +
                    '<Created>' + CreationDate + '</Created> ' +
                    '</DocumentProperties> ' +
                    '<OfficeDocumentSettings xmlns="urn:schemas-microsoft-com:office:office"> ' +
                    '<AllowPNG/> ' +
                    '</OfficeDocumentSettings> ' +
                    '<ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel"> ' +
                    '<WindowHeight>9000</WindowHeight> ' +
                    '<WindowWidth>13860</WindowWidth> ' +
                    '<WindowTopX>0</WindowTopX> ' +
                    '<WindowTopY>0</WindowTopY> ' +
                    '<ProtectStructure>False</ProtectStructure> ' +
                    '<ProtectWindows>False</ProtectWindows> ' +
                    '</ExcelWorkbook> ' +
                    '<Styles> ' +
                    '<Style ss:ID="Default" ss:Name="Default"> ' +
                    '<Alignment ss:Vertical="Center"/> ' +
                    '<Borders/> ' +
                    '<Font/> ' +
                    '<Interior/> ' +
                    '<NumberFormat/> ' +
                    '<Protection/> ' +
                    '</Style> ' +
                    '<Style ss:ID="Normal" ss:Name="Normal"/> ' +
                    '<Style ss:ID="pct1"> ' +
                    '  <NumberFormat ss:Format="Percent"/> ' +
                    '</Style> ' +
                    '</Styles>';

                for (let j = 0; j < docDatas.length; j++) {
                    let ssName = typeof defaults.worksheetName === 'string' ? defaults.worksheetName + ' ' + (j + 1) :
                        typeof defaults.worksheetName[j] !== 'undefined' ? defaults.worksheetName[j] :
                            'Table ' + (j + 1);

                    docFile += '<Worksheet ss:Name="' + ssName + '">' +
                        docDatas[j] +
                        '<WorksheetOptions/> ' +
                        '</Worksheet>';
                }

                docFile += '</Workbook>';

                if (defaults.consoleLog === true) {
                    console.log(docFile);
                }

                if (defaults.outputMode === 'string') {
                    return docFile;
                }

                if (defaults.outputMode === 'base64') {
                    return base64encode(docFile);
                }

                try {
                    blob = new Blob([docFile], {type: 'application/xml;charset=utf-8'});
                    saveAs(blob, defaults.fileName + '.xml');
                } catch (e) {
                    downloadFile(defaults.fileName + '.xml',
                        'data:application/xml;charset=utf-8;base64,',
                        xml);
                }
            } else if (defaults.type === 'excel' || defaults.type === 'xls' || defaults.type === 'word' || defaults.type === 'doc') {

                let MSDocType = (defaults.type === 'excel' || defaults.type === 'xls') ? 'excel' : 'word';
                let MSDocExt = (MSDocType === 'excel') ? 'xls' : 'doc';
                let MSDocSchema = 'xmlns:x="urn:schemas-microsoft-com:office:' + MSDocType + '"';
                var $tables = $(el).filter(function () {
                    return $(this).data('tableexport-display') !== 'none' &&
                        ($(this).is(':visible') ||
                            $(this).data('tableexport-display') === 'always');
                });
                let docData = '';

                $tables.each(function () {
                    let $table = $(this);
                    rowIndex = 0;
                    colNames = GetColumnNames(this);

                    docData += '<table><thead>';
                    // Header
                    $hrows = $table.find('thead').first().find(defaults.theadSelector);
                    $hrows.each(function () {
                        trData = '';
                        ForEachVisibleCell(this, 'th,td', rowIndex, $hrows.length,
                            function (cell, row, col) {
                                if (cell !== null) {
                                    let thstyle = '';
                                    trData += '<th';
                                    for (let styles in defaults.excelstyles) {
                                        if (defaults.excelstyles.hasOwnProperty(styles)) {
                                            let thcss = $(cell).css(defaults.excelstyles[styles]);
                                            if (thcss !== '' && thcss !== '0px none rgb(0, 0, 0)' && thcss !== 'rgba(0, 0, 0, 0)') {
                                                thstyle += (thstyle === '') ? 'style="' : ';';
                                                thstyle += defaults.excelstyles[styles] + ':' + thcss;
                                            }
                                        }
                                    }
                                    if (thstyle !== '') {
                                        trData += ' ' + thstyle + '"';
                                    }
                                    if ($(cell).is('[colspan]')) {
                                        trData += ' colspan="' + $(cell).attr('colspan') + '"';
                                    }
                                    if ($(cell).is('[rowspan]')) {
                                        trData += ' rowspan="' + $(cell).attr('rowspan') + '"';
                                    }
                                    trData += '>' + parseString(cell, row, col) + '</th>';
                                }
                            });
                        if (trData.length > 0) {
                            docData += '<tr>' + trData + '</tr>';
                        }
                        rowIndex++;
                    });

                    docData += '</thead><tbody>';
                    // Row Vs Column, support multiple tbodys
                    $table.find('tbody').each(function () {
                        $rows.push(...$(this).find(defaults.tbodySelector));
                    });
                    if (defaults.tfootSelector.length) {
                        $rows.push(...$table.find('tfoot').find(defaults.tfootSelector));
                    }

                    $($rows).each(function () {
                        let $row = $(this);
                        trData = '';
                        ForEachVisibleCell(this, 'td,th', rowIndex, $hrows.length + $rows.length,
                            function (cell, row, col) {
                                if (cell !== null) {
                                    let tdstyle = '';
                                    let tdcss = $(cell).data('tableexport-msonumberformat');

                                    if (typeof tdcss === 'undefined' && typeof defaults.onMsoNumberFormat === 'function') {
                                        tdcss = defaults.onMsoNumberFormat(cell, row, col);
                                    }

                                    if (typeof tdcss !== 'undefined' && tdcss !== '') {
                                        tdstyle = 'style="mso-number-format:\'' + tdcss + '\'';
                                    }

                                    for (let cssStyle in defaults.excelstyles) {
                                        if (defaults.excelstyles.hasOwnProperty(cssStyle)) {
                                            tdcss = $(cell).css(defaults.excelstyles[cssStyle]);
                                            if (tdcss === '') {
                                                tdcss = $row.css(defaults.excelstyles[cssStyle]);
                                            }

                                            if (tdcss !== '' && tdcss !== '0px none rgb(0, 0, 0)' && tdcss !== 'rgba(0, 0, 0, 0)') {
                                                tdstyle += (tdstyle === '') ? 'style="' : ';';
                                                tdstyle += defaults.excelstyles[cssStyle] + ':' + tdcss;
                                            }
                                        }
                                    }
                                    trData += '<td';
                                    if (tdstyle !== '') {
                                        trData += ' ' + tdstyle + '"';
                                    }
                                    if ($(cell).is('[colspan]')) {
                                        trData += ' colspan="' + $(cell).attr('colspan') + '"';
                                    }
                                    if ($(cell).is('[rowspan]')) {
                                        trData += ' rowspan="' + $(cell).attr('rowspan') + '"';
                                    }
                                    trData += '>' + parseString(cell, row, col).replace(/\n/g, '<br>') + '</td>';
                                }
                            });
                        if (trData.length > 0) {
                            docData += '<tr>' + trData + '</tr>';
                        }
                        rowIndex++;
                    });

                    if (defaults.displayTableName) {
                        docData += '<tr><td></td></tr><tr><td></td></tr><tr><td>' + parseString($('<p>' + defaults.tableName + '</p>')) + '</td></tr>';
                    }

                    docData += '</tbody></table>';

                    if (defaults.consoleLog === true) {
                        console.log(docData);
                    }
                });

                var docFile = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' + MSDocSchema + ' xmlns="http://www.w3.org/TR/REC-html40">';
                docFile += '<meta http-equiv="Content-Type" content="application/vnd.ms-' + MSDocType + '; charset=UTF-8">';
                docFile += '<head>';
                if (MSDocType === 'excel') {
                    docFile += '<!--[if gte mso 9]>';
                    docFile += '<xml>';
                    docFile += '<x:ExcelWorkbook>';
                    docFile += '<x:ExcelWorksheets>';
                    docFile += '<x:ExcelWorksheet>';
                    docFile += '<x:Name>';
                    docFile += defaults.worksheetName;
                    docFile += '</x:Name>';
                    docFile += '<x:WorksheetOptions>';
                    docFile += '<x:DisplayGridlines/>';
                    docFile += '</x:WorksheetOptions>';
                    docFile += '</x:ExcelWorksheet>';
                    docFile += '</x:ExcelWorksheets>';
                    docFile += '</x:ExcelWorkbook>';
                    docFile += '</xml>';
                    docFile += '<![endif]-->';
                }
                docFile += '<style>br {mso-data-placement:same-cell;}</style>';
                docFile += '</head>';
                docFile += '<body>';
                docFile += docData;
                docFile += '</body>';
                docFile += '</html>';

                if (defaults.consoleLog === true) {
                    console.log(docFile);
                }

                if (defaults.outputMode === 'string') {
                    return docFile;
                }

                if (defaults.outputMode === 'base64') {
                    return base64encode(docFile);
                }

                try {
                    blob = new Blob([docFile], {type: 'application/vnd.ms-' + defaults.type});
                    saveAs(blob, defaults.fileName + '.' + MSDocExt);
                } catch (e) {
                    downloadFile(defaults.fileName + '.' + MSDocExt,
                        'data:application/vnd.ms-' + MSDocType + ';base64,',
                        docFile);
                }

            } else if (defaults.type === 'xlsx') {

                let data = [];
                let ranges = [];
                rowIndex = 0;

                $rows = $(el).find('thead').first().find(defaults.theadSelector);
                $(el).find('tbody').each(function () {
                    $rows.push(...$(this).find(defaults.tbodySelector));
                });
                if (defaults.tfootSelector.length) {
                    $rows.push(...$(el).find('tfoot').find(defaults.tfootSelector));
                }

                $($rows).each(function () {
                    let cols = [];
                    ForEachVisibleCell(this, 'th,td', rowIndex, $rows.length,
                        function (cell, row, col) {
                            if (typeof cell !== 'undefined' && cell !== null) {

                                let colspan = parseInt(cell.getAttribute('colspan'));
                                let rowspan = parseInt(cell.getAttribute('rowspan'));

                                let cellValue = parseString(cell, row, col);

                                if (cellValue !== '' && cellValue === +cellValue) cellValue = +cellValue;

                                // Skip ranges
                                ranges.forEach(function (range) {
                                    if (rowIndex >= range.s.r && rowIndex <= range.e.r && cols.length >= range.s.c && cols.length <= range.e.c) {
                                        for (let i = 0; i <= range.e.c - range.s.c; ++i) cols.push(null);
                                    }
                                });

                                // Handle Row Span
                                if (rowspan || colspan) {
                                    rowspan = rowspan || 1;
                                    colspan = colspan || 1;
                                    ranges.push({
                                        s: {r: rowIndex, c: cols.length},
                                        e: {r: rowIndex + rowspan - 1, c: cols.length + colspan - 1}
                                    });
                                }

                                // Handle Value
                                cols.push(cellValue !== '' ? cellValue : null);

                                // Handle Colspan
                                if (colspan) for (let k = 0; k < colspan - 1; ++k) cols.push(null);
                            }
                        });
                    data.push(cols);
                    rowIndex++;
                });

                let wb = new jx_Workbook(),
                    ws = jx_createSheet(data);

                // add ranges to worksheet
                // https://stackoverflow.com/questions/27548378/exporting-an-array-to-excel-file-with-cell-formatting
                ws['!merges'] = ranges;

                // add worksheet to workbook
                wb.SheetNames.push(defaults.worksheetName);
                wb.Sheets[defaults.worksheetName] = ws;

                let wbout = XLSX.write(wb, {bookType: defaults.type, bookSST: false, type: 'binary'});

                try {
                    blob = new Blob([jx_s2ab(wbout)], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'});
                    saveAs(blob, defaults.fileName + '.' + defaults.type);
                } catch (e) {
                    downloadFile(defaults.fileName + '.' + defaults.type,
                        'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8,',
                        blob);
                }

            } else if (defaults.type === 'png') {
                // html2canvas($(el)[0], {
                //  onrendered: function (canvas) {
                html2canvas($(el)[0]).then(
                    function (canvas) {

                        let image = canvas.toDataURL();
                        let byteString = atob(image.substring(22)); // remove data stuff
                        let buffer = new ArrayBuffer(byteString.length);
                        let intArray = new Uint8Array(buffer);

                        for (let i = 0; i < byteString.length; i++) {
                            intArray[i] = byteString.charCodeAt(i);
                        }

                        if (defaults.consoleLog === true) {
                            console.log(byteString);
                        }

                        if (defaults.outputMode === 'string') {
                            return byteString;
                        }

                        if (defaults.outputMode === 'base64') {
                            return base64encode(image);
                        }

                        if (defaults.outputMode === 'window') {
                            window.open(image);
                            return;
                        }

                        try {
                            blob = new Blob([buffer], {type: 'image/png'});
                            saveAs(blob, defaults.fileName + '.png');
                        } catch (e) {
                            downloadFile(defaults.fileName + '.png', 'data:image/png,', blob);
                        }
                        // }
                    });

            } else if (defaults.type === 'pdf') {
                // 以下中文直接轉匯出現會亂碼，所以使用html2canvas解析成png
                html2canvas($(el)[0]).then(
                    function (canvas) {
                        let contentWidth = canvas.width;
                        let contentHeight = canvas.height;

                        let pageHeight = contentWidth / 592.28 * 841.89;
                        let leftHeight = contentHeight;

                        let position = 0;
                        // a4纸的尺寸[595.28,841.89]
                        let imgWidth = 595.28;
                        let imgHeight = 592.28 / contentWidth * contentHeight;

                        let data = canvas.toDataURL();

                        if (defaults.outputMode === 'string') {
                            return data;
                        }

                        let pdf = new jsPDF('', 'pt', 'a4');

                        // 判斷是否要分頁，這裡如果table結構太複雜我怕會出錯，之後再向想如何判斷
                        if (leftHeight < pageHeight) {
                            pdf.addImage(data, 'JPEG', 0, 0, imgWidth, imgHeight);
                        } else {
                            while (leftHeight > 0) {
                                pdf.addImage(data, 'JPEG', 0, position, imgWidth, imgHeight);
                                leftHeight -= pageHeight;
                                position -= 841.89;
                                // 空白頁
                                if (leftHeight > 0) {
                                    pdf.addPage();
                                }
                            }
                        }

                        jsPdfOutput(pdf, false);
                    }
                );
            }


            function GetColumnNames(table) {
                let result = [];
                $(table).find('thead').first().find('th').each(function (index, el) {
                    if ($(el).attr('data-field') !== undefined) {
                        result[index] = $(el).attr('data-field');
                    } else {
                        result[index] = index.toString();
                    }
                });
                return result;
            }

            function isColumnIgnored(rowLength, colIndex) {
                let result = false;
                if (defaults.ignoreColumn.length > 0) {
                    if (typeof defaults.ignoreColumn[0] === 'string') {
                        if (colNames.length > colIndex && typeof colNames[colIndex] !== 'undefined') {
                            if ($.inArray(colNames[colIndex], defaults.ignoreColumn) !== -1) {
                                result = true;
                            }
                        }
                    } else if (typeof defaults.ignoreColumn[0] === 'number') {
                        if ($.inArray(colIndex, defaults.ignoreColumn) !== -1 ||
                            $.inArray(colIndex - rowLength, defaults.ignoreColumn) !== -1) {
                            result = true;
                        }
                    }
                }
                return result;
            }

            function ForEachVisibleCell(tableRow, selector, rowIndex, rowCount, cellcallback) {
                if ($.inArray(rowIndex, defaults.ignoreRow) === -1 &&
                    $.inArray(rowIndex - rowCount, defaults.ignoreRow) === -1) {

                    let $row = $(tableRow).filter(function () {
                        return $(this).data('tableexport-display') !== 'none' &&
                            ($(this).is(':visible') ||
                                $(this).data('tableexport-display') === 'always' ||
                                $(this).closest('table').data('tableexport-display') === 'always');
                    }).find(selector);

                    let rowColspan = 0;

                    $row.each(function (colIndex) {
                        if ($(this).data('tableexport-display') === 'always' ||
                            ($(this).css('display') !== 'none' &&
                                $(this).css('visibility') !== 'hidden' &&
                                $(this).data('tableexport-display') !== 'none')) {
                            if (typeof (cellcallback) === 'function') {
                                let c,
                                    Colspan = 1;
                                let r,
                                    Rowspan = 1;
                                let rowLength = $row.length;

                                // handle rowspans from previous rows
                                if (typeof rowspans[rowIndex] !== 'undefined' && rowspans[rowIndex].length > 0) {
                                    let colCount = colIndex;
                                    for (c = 0; c <= colCount; c++) {
                                        if (typeof rowspans[rowIndex][c] !== 'undefined') {
                                            cellcallback(null, rowIndex, c);
                                            delete rowspans[rowIndex][c];
                                            colCount++;
                                        }
                                    }
                                    colIndex += rowspans[rowIndex].length;
                                    rowLength += rowspans[rowIndex].length;
                                }

                                if ($(this).is('[colspan]')) {
                                    Colspan = parseInt($(this).attr('colspan')) || 1;

                                    rowColspan += Colspan > 0 ? Colspan - 1 : 0;
                                }

                                if ($(this).is('[rowspan]')) {
                                    Rowspan = parseInt($(this).attr('rowspan')) || 1;
                                }

                                if (isColumnIgnored(rowLength, colIndex + rowColspan) === false) {
                                    // output content of current cell
                                    cellcallback(this, rowIndex, colIndex);

                                    // handle colspan of current cell
                                    for (c = 1; c < Colspan; c++) {
                                        cellcallback(null, rowIndex, colIndex + c);
                                    }
                                }

                                // store rowspan for following rows
                                if (Rowspan > 1) {
                                    for (r = 1; r < Rowspan; r++) {
                                        if (typeof rowspans[rowIndex + r] === 'undefined') {
                                            rowspans[rowIndex + r] = [];
                                        }

                                        rowspans[rowIndex + r][colIndex + rowColspan] = '';

                                        for (c = 1; c < Colspan; c++) {
                                            rowspans[rowIndex + r][colIndex + rowColspan - c] = '';
                                        }
                                    }
                                }
                            }
                        }
                    });
                    // handle rowspans from previous rows
                    if (typeof rowspans[rowIndex] !== 'undefined' && rowspans[rowIndex].length > 0) {
                        for (let c = 0; c <= rowspans[rowIndex].length; c++) {
                            if (typeof rowspans[rowIndex][c] !== 'undefined') {
                                cellcallback(null, rowIndex, c);
                                delete rowspans[rowIndex][c];
                            }
                        }
                    }
                }
            }

            function jsPdfOutput(doc, hasimages) {
                if (defaults.consoleLog === true) {
                    console.log(doc.output());
                }

                if (defaults.outputMode === 'string') {
                    return doc.output();
                }

                if (defaults.outputMode === 'base64') {
                    return base64encode(doc.output());
                }

                if (defaults.outputMode === 'window') {
                    window.open(URL.createObjectURL(doc.output('blob')));
                    return;
                }

                try {
                    var blob = doc.output('blob');
                    saveAs(blob, defaults.fileName + '.pdf');
                } catch (e) {
                    downloadFile(defaults.fileName + '.pdf',
                        'data:application/pdf' + (hasimages ? '' : ';base64') + ',',
                        hasimages ? blob : doc.output());
                }
            }

            function drawAutotableElements(cell, elements, teOptions) {
                elements.each(function () {
                    let kids = $(this).children();

                    if ($(this).is('div')) {
                        let bcolor = rgb2array(getStyle(this, 'background-color'), [255, 255, 255]);
                        let lcolor = rgb2array(getStyle(this, 'border-top-color'), [0, 0, 0]);
                        let lwidth = getPropertyUnitValue(this, 'border-top-width', defaults.jspdf.unit);

                        let r = this.getBoundingClientRect();
                        let ux = this.offsetLeft * teOptions.dw;
                        var uy = this.offsetTop * teOptions.dh;
                        let uw = r.width * teOptions.dw;
                        let uh = r.height * teOptions.dh;

                        teOptions.doc.setDrawColor.apply(undefined, lcolor);
                        teOptions.doc.setFillColor.apply(undefined, bcolor);
                        teOptions.doc.setLineWidth(lwidth);
                        teOptions.doc.rect(cell.x + ux, cell.y + uy, uw, uh, lwidth ? 'FD' : 'F');
                    } else if ($(this).is('img')) {
                        if (typeof teOptions.images !== 'undefined') {
                            let hash = strHashCode(this.src);
                            let image = teOptions.images[hash];

                            if (typeof image !== 'undefined') {

                                let arCell = cell.width / cell.height;
                                let arImg = this.width / this.height;
                                let imgWidth = cell.width;
                                let imgHeight = cell.height;
                                let px2pt = 0.264583 * 72 / 25.4;
                                var uy = 0;

                                if (arImg <= arCell) {
                                    imgHeight = Math.min(cell.height, this.height);
                                    imgWidth = this.width * imgHeight / this.height;
                                } else if (arImg > arCell) {
                                    imgWidth = Math.min(cell.width, this.width);
                                    imgHeight = this.height * imgWidth / this.width;
                                }

                                imgWidth *= px2pt;
                                imgHeight *= px2pt;

                                if (imgHeight < cell.height) {
                                    uy = (cell.height - imgHeight) / 2;
                                }

                                try {
                                    teOptions.doc.addImage(image.src, cell.textPos.x, cell.y + uy, imgWidth, imgHeight);
                                } catch (e) {
                                    // TODO: IE -> convert png to jpeg
                                }
                                cell.textPos.x += imgWidth;
                            }
                        }
                    }

                    if (typeof kids !== 'undefined' && kids.length > 0) {
                        drawAutotableElements(cell, kids, teOptions);
                    }
                });
            }

            function drawAutotableText(cell, texttags, teOptions) {
                if (typeof teOptions.onAutotableText === 'function') {
                    teOptions.onAutotableText(teOptions.doc, cell, texttags);
                } else {
                    let x = cell.textPos.x;
                    let y = cell.textPos.y;
                    let style = {halign: cell.styles.halign, valign: cell.styles.valign};

                    if (texttags.length) {
                        let tag = texttags[0];
                        while (tag.previousSibling) {
                            tag = tag.previousSibling;
                        }

                        let b = false,
                            i = false;

                        while (tag) {
                            let txt = tag.innerText || tag.textContent || '';

                            txt = ((txt.length && txt[0] === ' ') ? ' ' : '') +
                                $.trim(txt) +
                                ((txt.length > 1 && txt[txt.length - 1] === ' ') ? ' ' : '');

                            if ($(tag).is('br')) {
                                x = cell.textPos.x;
                                y += teOptions.doc.internal.getFontSize();
                            }

                            if ($(tag).is('b')) {
                                b = true;
                            } else if ($(tag).is('i')) {
                                i = true;
                            }

                            if (b || i) {
                                teOptions.doc.setFontType((b && i) ? 'bolditalic' : b ? 'bold' : 'italic');
                            }

                            let w = teOptions.doc.getStringUnitWidth(txt) * teOptions.doc.internal.getFontSize();

                            if (w) {
                                if (cell.styles.overflow === 'linebreak' &&
                                    x > cell.textPos.x && (x + w) > (cell.textPos.x + cell.width)) {
                                    let chars = '.,!%*;:=-';
                                    if (chars.indexOf(txt.charAt(0)) >= 0) {
                                        let s = txt.charAt(0);
                                        w = teOptions.doc.getStringUnitWidth(s) * teOptions.doc.internal.getFontSize();
                                        if ((x + w) <= (cell.textPos.x + cell.width)) {
                                            teOptions.doc.autoTableText(s, x, y, style);
                                            txt = txt.substring(1, txt.length);
                                        }
                                        w = teOptions.doc.getStringUnitWidth(txt) * teOptions.doc.internal.getFontSize();
                                    }
                                    x = cell.textPos.x;
                                    y += teOptions.doc.internal.getFontSize();
                                }

                                while (txt.length && (x + w) > (cell.textPos.x + cell.width)) {
                                    txt = txt.substring(0, txt.length - 1);
                                    w = teOptions.doc.getStringUnitWidth(txt) * teOptions.doc.internal.getFontSize();
                                }

                                teOptions.doc.autoTableText(txt, x, y, style);
                                x += w;
                            }

                            if (b || i) {
                                if ($(tag).is('b')) {
                                    b = false;
                                } else if ($(tag).is('i')) {
                                    i = false;
                                }

                                teOptions.doc.setFontType((!b && !i) ? 'normal' : b ? 'bold' : 'italic');
                            }

                            tag = tag.nextSibling;
                        }
                        cell.textPos.x = x;
                        cell.textPos.y = y;
                    } else {
                        teOptions.doc.autoTableText(cell.text, cell.textPos.x, cell.textPos.y, style);
                    }
                }
            }

            function escapeRegExp(string) {
                return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
            }

            function replaceAll(string, find, replace) {
                return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
            }

            function parseNumber(value) {
                value = value || '0';
                value = replaceAll(value, defaults.numbers.html.thousandsSeparator, '');
                value = replaceAll(value, defaults.numbers.html.decimalMark, '.');

                return typeof value === 'number' || jQuery.isNumeric(value) !== false ? value : false;
            }

            function parsePercent(value) {
                if (value.indexOf('%') > -1) {
                    value = parseNumber(value.replace(/%/g, ''));
                    if (value !== false) {
                        value /= 100;
                    }
                } else {
                    value = false;
                }
                return value;
            }

            function parseString(cell, rowIndex, colIndex) {
                let result = '';

                if (cell !== null) {
                    let $cell = $(cell);
                    let htmlData;

                    if ($cell[0].hasAttribute('data-tableexport-value')) {
                        htmlData = $cell.data('tableexport-value');
                    } else {
                        htmlData = $cell.html();

                        if (typeof defaults.onCellHtmlData === 'function') {
                            htmlData = defaults.onCellHtmlData($cell, rowIndex, colIndex, htmlData);
                        } else if (htmlData !== '') {
                            let html = $.parseHTML(htmlData);
                            let inputidx = 0;
                            let selectidx = 0;

                            htmlData = '';
                            $.each(html, function () {
                                if ($(this).is('input')) {
                                    htmlData += $cell.find('input').eq(inputidx++).val();
                                } else if ($(this).is('select')) {
                                    htmlData += $cell.find('select option:selected').eq(selectidx++).text();
                                } else if (typeof $(this).html() === 'undefined') {
                                    htmlData += $(this).text();
                                } else if (jQuery().bootstrapTable === undefined || $(this).hasClass('filterControl') !== true) {
                                    htmlData += $(this).html();
                                }
                            });
                        }
                    }

                    if (defaults.htmlContent === true) {
                        result = $.trim(htmlData);
                    } else if (htmlData !== '') {
                        let text = htmlData.replace(/\n/g, '\u2028').replace(/<br\s*[\/]?>/gi, '\u2060');
                        let obj = $('<div/>').html(text).contents();
                        text = '';
                        $.each(obj.text().split('\u2028'), function (i, v) {
                            if (i > 0) {
                                text += ' ';
                            }
                            text += $.trim(v);
                        });

                        $.each(text.split('\u2060'), function (i, v) {
                            if (i > 0) {
                                result += '\n';
                            }
                            result += $.trim(v).replace(/\u00AD/g, ''); // remove soft hyphens
                        });

                        if (defaults.type === 'json' ||
                            (defaults.type === 'excel' && defaults.excelFileFormat === 'xmlss') ||
                            defaults.numbers.output === false) {
                            var number = parseNumber(result);

                            if (number !== false) {
                                result = Number(number);
                            }
                        } else if (defaults.numbers.html.decimalMark !== defaults.numbers.output.decimalMark ||
                            defaults.numbers.html.thousandsSeparator !== defaults.numbers.output.thousandsSeparator) {
                            var number = parseNumber(result);

                            if (number !== false) {
                                let frac = ('' + number).split('.');
                                if (frac.length === 1) {
                                    frac[1] = '';
                                }
                                let mod = frac[0].length > 3 ? frac[0].length % 3 : 0;

                                result = (number < 0 ? '-' : '') +
                                    (defaults.numbers.output.thousandsSeparator ? ((mod ? frac[0].substr(0, mod) + defaults.numbers.output.thousandsSeparator : '') + frac[0].substr(mod).replace(/(\d{3})(?=\d)/g, '$1' + defaults.numbers.output.thousandsSeparator)) : frac[0]) +
                                    (frac[1].length ? defaults.numbers.output.decimalMark + frac[1] : '');
                            }
                        }
                    }

                    if (defaults.escape === true) {
                        result = escape(result);
                    }

                    if (typeof defaults.onCellData === 'function') {
                        result = defaults.onCellData($cell, rowIndex, colIndex, result);
                    }
                }

                return result;
            }

            function hyphenate(a, b, c) {
                return b + '-' + c.toLowerCase();
            }

            function rgb2array(rgb_string, default_result) {
                let re = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;
                let bits = re.exec(rgb_string);
                let result = default_result;
                if (bits) {
                    result = [parseInt(bits[1]), parseInt(bits[2]), parseInt(bits[3])];
                }
                return result;
            }

            function getCellStyles(cell) {
                let a = getStyle(cell, 'text-align');
                let fw = getStyle(cell, 'font-weight');
                let fs = getStyle(cell, 'font-style');
                let f = '';
                if (a === 'start') {
                    a = getStyle(cell, 'direction') === 'rtl' ? 'right' : 'left';
                }
                if (fw >= 700) {
                    f = 'bold';
                }
                if (fs === 'italic') {
                    f += fs;
                }
                if (f === '') {
                    f = 'normal';
                }

                let result = {
                    style: {
                        align: a,
                        bcolor: rgb2array(getStyle(cell, 'background-color'), [255, 255, 255]),
                        color: rgb2array(getStyle(cell, 'color'), [0, 0, 0]),
                        fstyle: f
                    },
                    colspan: (parseInt($(cell).attr('colspan')) || 0),
                    rowspan: (parseInt($(cell).attr('rowspan')) || 0)
                };

                if (cell !== null) {
                    let r = cell.getBoundingClientRect();
                    result.rect = {
                        width: r.width,
                        height: r.height
                    };
                }

                return result;
            }

            // get computed style property
            function getStyle(target, prop) {
                try {
                    if (window.getComputedStyle) { // gecko and webkit
                        prop = prop.replace(/([a-z])([A-Z])/, hyphenate);  // requires hyphenated, not camel
                        return window.getComputedStyle(target, null).getPropertyValue(prop);
                    }
                    if (target.currentStyle) { // ie
                        return target.currentStyle[prop];
                    }
                    return target.style[prop];
                } catch (e) {
                }
                return '';
            }

            function getUnitValue(parent, value, unit) {
                let baseline = 100;  // any number serves

                let temp = document.createElement('div');  // create temporary element
                temp.style.overflow = 'hidden';  // in case baseline is set too low
                temp.style.visibility = 'hidden';  // no need to show it

                parent.appendChild(temp); // insert it into the parent for em, ex and %

                temp.style.width = baseline + unit;
                let factor = baseline / temp.offsetWidth;

                parent.removeChild(temp);  // clean up

                return (value * factor);
            }

            function getPropertyUnitValue(target, prop, unit) {
                let value = getStyle(target, prop);  // get the computed style value

                let numeric = value.match(/\d+/);  // get the numeric component
                if (numeric !== null) {
                    numeric = numeric[0];  // get the string

                    return getUnitValue(target.parentElement, numeric, unit);
                }
                return 0;
            }

            function jx_Workbook() {
                if (!(this instanceof jx_Workbook)) return new jx_Workbook();
                this.SheetNames = [];
                this.Sheets = {};
            }

            function jx_s2ab(s) {
                let buf = new ArrayBuffer(s.length);
                let view = new Uint8Array(buf);
                for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                return buf;
            }

            function jx_datenum(v, date1904) {
                if (date1904) v += 1462;
                let epoch = Date.parse(v);
                return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
            }

            function jx_createSheet(data) {
                let ws = {};
                let range = {s: {c: 10000000, r: 10000000}, e: {c: 0, r: 0}};
                for (let R = 0; R !== data.length; ++R) {
                    for (let C = 0; C !== data[R].length; ++C) {
                        if (range.s.r > R) range.s.r = R;
                        if (range.s.c > C) range.s.c = C;
                        if (range.e.r < R) range.e.r = R;
                        if (range.e.c < C) range.e.c = C;
                        let cell = {v: data[R][C]};
                        if (cell.v === null) continue;
                        let cell_ref = XLSX.utils.encode_cell({c: C, r: R});

                        if (typeof cell.v === 'number') cell.t = 'n';
                        else if (typeof cell.v === 'boolean') cell.t = 'b';
                        else if (cell.v instanceof Date) {
                            cell.t = 'n';
                            cell.z = XLSX.SSF._table[14];
                            cell.v = jx_datenum(cell.v);
                        } else cell.t = 's';
                        ws[cell_ref] = cell;
                    }
                }

                if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
                return ws;
            }

            function strHashCode(str) {
                let hash = 0,
                    i,
                    chr,
                    len;
                if (str.length === 0) return hash;
                for (i = 0, len = str.length; i < len; i++) {
                    chr = str.charCodeAt(i);
                    hash = ((hash << 5) - hash) + chr;
                    hash |= 0; // Convert to 32bit integer
                }
                return hash;
            }


            function downloadFile(filename, header, data) {

                let ua = window.navigator.userAgent;
                if (filename !== false && (ua.indexOf('MSIE ') > 0 || !!ua.match(/Trident.*rv\:11\./))) {
                    if (window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(new Blob([data]), filename);
                    } else {
                        // based on sampopes answer on http://stackoverflow.com/questions/22317951
                        let frame = document.createElement('iframe');

                        if (frame) {
                            document.body.appendChild(frame);
                            frame.setAttribute('style', 'display:none');
                            frame.contentDocument.open('txt/html', 'replace');
                            frame.contentDocument.write(data);
                            frame.contentDocument.close();
                            frame.focus();

                            frame.contentDocument.execCommand('SaveAs', true, filename);
                            document.body.removeChild(frame);
                        }
                    }
                } else {
                    let DownloadLink = document.createElement('a');

                    if (DownloadLink) {
                        let blobUrl = null;

                        DownloadLink.style.display = 'none';
                        if (filename !== false) {
                            DownloadLink.download = filename;
                        } else {
                            DownloadLink.target = '_blank';
                        }

                        if (typeof data === 'object') {
                            blobUrl = window.URL.createObjectURL(data);
                            DownloadLink.href = blobUrl;
                        } else if (header.toLowerCase().indexOf('base64,') >= 0) {
                            DownloadLink.href = header + base64encode(data);
                        } else {
                            DownloadLink.href = header + encodeURIComponent(data);
                        }

                        document.body.appendChild(DownloadLink);

                        if (document.createEvent) {
                            if (DownloadEvt === null) {
                                DownloadEvt = document.createEvent('MouseEvents');
                            }

                            DownloadEvt.initEvent('click', true, false);
                            DownloadLink.dispatchEvent(DownloadEvt);
                        } else if (document.createEventObject) {
                            DownloadLink.fireEvent('onclick');
                        } else if (typeof DownloadLink.onclick === 'function') {
                            DownloadLink.onclick();
                        }

                        if (blobUrl) {
                            window.URL.revokeObjectURL(blobUrl);
                        }

                        document.body.removeChild(DownloadLink);
                    }
                }
            }

            function utf8Encode(string) {
                string = string.replace(/\x0d\x0a/g, '\x0a');
                let utftext = '';
                for (let n = 0; n < string.length; n++) {
                    let c = string.charCodeAt(n);
                    if (c < 128) {
                        utftext += String.fromCharCode(c);
                    } else if ((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    } else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                }
                return utftext;
            }

            function base64encode(input) {
                let keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                let output = '';
                let chr1,
                    chr2,
                    chr3,
                    enc1,
                    enc2,
                    enc3,
                    enc4;
                let i = 0;
                input = utf8Encode(input);
                while (i < input.length) {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);
                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;
                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }
                    output = output +
                        keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                        keyStr.charAt(enc3) + keyStr.charAt(enc4);
                }
                return output;
            }

            return this;
        }
    });
