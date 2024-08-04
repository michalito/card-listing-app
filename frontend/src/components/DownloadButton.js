import React from 'react';
import { CSVLink } from 'react-csv';

const DownloadButton = ({ cards }) => {
  const headers = [
    { label: 'Name', key: 'name' },
    { label: 'Set', key: 'set' },
    { label: 'Price', key: 'price' },
    { label: 'Quantity', key: 'quantity' },
    { label: 'Is Foil', key: 'isFoil' },
    { label: 'Condition', key: 'condition' },
    { label: 'Language', key: 'language' },
    { label: 'Comment', key: 'comment' },
  ];

  return (
    <CSVLink data={cards} headers={headers} filename="cards.csv">
      Download CSV
    </CSVLink>
  );
};

export default DownloadButton;
