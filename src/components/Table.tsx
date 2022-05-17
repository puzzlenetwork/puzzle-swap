import React from "react";
import { TableProps, useTable } from "react-table";
import styled from "@emotion/styled";

interface IProps extends TableProps {
  columns: any[];
  data: any[];
}

const Root = styled.div`
  width: 100%;
  border-radius: 16px;
  background: #ffffff;

  table {
    width: 100%;
    border-spacing: 0;

    tr {
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      color: #8082c5;
      width: 100%;
      transition: 0.4s;
      cursor: pointer;

      :hover {
        background: #f8f8ff;
      }

      :last-child {
        td {
        }
      }
    }

    th {
      font-weight: 400;
      font-size: 14px;
      line-height: 16px;
      text-align: left;
      padding: 14px;
      border-bottom: 1px solid #f1f2fe;
      background: #ffffff;
      cursor: default;
    }

    td {
      font-weight: 400;
      font-size: 16px;
      line-height: 20px;
      color: #363870;
      padding: 16px;
      border-bottom: 1px solid #f1f2fe;

      :last-child {
        border-right: 0;
      }
    }
  }
`;

const Table: React.FC<IProps> = ({ columns, data, ...rest }) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });
  return (
    <Root {...rest}>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup, index) => (
            <tr
              {...headerGroup.getHeaderGroupProps()}
              key={index + "tr-header"}
            >
              {headerGroup.headers.map((column, index) => (
                <th {...column.getHeaderProps()} key={index + "th"}>
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr
                {...row.getRowProps()}
                key={i + "tr"}
                onClick={() => row.original.onClick()}
              >
                {row.cells.map((cell, index) => (
                  <td {...cell.getCellProps()} key={index + "td"}>
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </Root>
  );
};

export default Table;
