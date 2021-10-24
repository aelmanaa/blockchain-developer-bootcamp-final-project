const Select = (props) => {
  const options = props.select.options;
  const optionLabels = props.select.optionLabels;

  const optionsTags = options.map((element, index) => (
    <option key={element} value={element}>
      {optionLabels[index]}
    </option>
  ));
  const selectAttributes = props.select;
  delete selectAttributes.options;
  delete selectAttributes.optionLabels;

  return (
    <div>
      <label htmlFor={props.select.id}>{props.label}</label>
      <select {...selectAttributes}>{optionsTags}</select>
    </div>
  );
};

export default Select;
