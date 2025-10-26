import React from "react";
import "./Table.css";

export function Table({ className = "", children, ...props }) {
  return (
    <div className="table-container">
      <table className={`table ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className = "", children, ...props }) {
  return (
    <thead className={`table-header ${className}`} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className = "", children, ...props }) {
  return (
    <tbody className={`table-body ${className}`} {...props}>
      {children}
    </tbody>
  );
}

export function TableFooter({ className = "", children, ...props }) {
  return (
    <tfoot className={`table-footer ${className}`} {...props}>
      {children}
    </tfoot>
  );
}

export function TableRow({ className = "", children, ...props }) {
  return (
    <tr className={`table-row ${className}`} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ className = "", children, ...props }) {
  return (
    <th className={`table-head ${className}`} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ className = "", children, ...props }) {
  return (
    <td className={`table-cell ${className}`} {...props}>
      {children}
    </td>
  );
}

export function TableCaption({ className = "", children, ...props }) {
  return (
    <caption className={`table-caption ${className}`} {...props}>
      {children}
    </caption>
  );
}
