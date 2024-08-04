import React from 'react';

const CardSummary = ({ cards }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Set</th>
          <th>Price</th>
          <th>Quantity</th>
          <th>Is Foil</th>
          <th>Condition</th>
          <th>Language</th>
          <th>Comment</th>
        </tr>
      </thead>
      <tbody>
        {cards.map((card, index) => (
          <tr key={index}>
            <td>{card.name}</td>
            <td>{card.set}</td>
            <td>{card.price}</td>
            <td>{card.quantity}</td>
            <td>{card.isFoil ? 'Yes' : 'No'}</td>
            <td>{card.condition}</td>
            <td>{card.language}</td>
            <td>{card.comment}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CardSummary;
