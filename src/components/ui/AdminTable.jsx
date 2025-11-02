// /src/components/ui/AdminTable.jsx
import React from "react";
import Button from "./../ui/button/Button";

const AdminTable = ({
  title,
  data = [],
  columns = [],
  onShow,
  onEdit,
  onDelete,
  onAdd,
  addText = "Add New",
  className = "",
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          {onAdd && (
            <Button type="button" onClick={onAdd} variant="primary" className="cursor-pointer">
              {addText}
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column, i) => (
                <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {column.header}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-wrap gap-2">
                    {onShow && (
                      <Button
                        type="button"
                        variant="primary"
                        className="cursor-pointer"
                        onClick={() => onShow(item, index)}
                      >
                        Show
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        type="button"
                        variant="update"
                        className="cursor-pointer"
                        onClick={() => onEdit(item, index)}
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        type="button"
                        variant="delete"
                        className="cursor-pointer"
                        onClick={() => onDelete(index)}   // AdminTable’s API expects index
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default AdminTable;

