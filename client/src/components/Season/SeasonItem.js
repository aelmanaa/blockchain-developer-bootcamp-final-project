const SeasonItem = (props) => {
  return (
    <tr>
      <td>{props.id}</td>
      <td>{props.state}</td>
      <td>
        <button>clickme</button>
      </td>
    </tr>
  );
};

export default SeasonItem;
