import React from 'react';
import PropTypes from 'prop-types';

import './style.sass';

const Main = ({ fieldValue }) => (
  <div className="container">
    {JSON.stringify(fieldValue)}
  </div>
);

Main.propTypes = {
  fieldValue: PropTypes.bool.isRequired,
};

export default Main;
