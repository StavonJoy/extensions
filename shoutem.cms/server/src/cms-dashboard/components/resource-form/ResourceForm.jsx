import React, { PropTypes } from 'react';
import _ from 'lodash';
import { reduxForm } from 'redux-form';
import { Button, ButtonToolbar, HelpBlock } from 'react-bootstrap';
import { LoaderContainer } from '@shoutem/react-web-ui';
import { getFormState } from '../../redux';
import {
  resolveSchemaElements,
  validateResourceForm,
  getSchemaPropertyKeys,
  getEditorCreateConfirmButtonLabel,
  getEditorUpdateConfirmButtonLabel,
  getEditorCreateAbortButtonLabel,
  getEditorUpdateAbortButtonLabel,
} from '../../services';
import './style.scss';

function ResourceForm({
  schema,
  canonicalName,
  assetManager,
  submitting,
  pristine,
  fields,
  onCancel,
  touch,
  googleApiKey,
  handleSubmit,
  values,
  error,
}) {
  const id = _.get(fields, 'id');
  const inEditMode = !_.isEmpty(id.value);

  // needs to be calculated again, as error prop is not returing validation errors
  // fixed in v6 redux-form, but we are using v5
  const validationErrors = validateResourceForm(schema, values);

  const options = {
    assetManager,
    canonicalName,
    touch,
    googleApiKey,
  };
  const elements = resolveSchemaElements(schema, fields, options);

  return (
    <form className="resource-form" onSubmit={handleSubmit}>
      {elements}
      <ButtonToolbar>
        <Button
          bsSize="large"
          bsStyle="primary"
          disabled={submitting || pristine || !_.isEmpty(validationErrors)}
          type="submit"
        >
          <LoaderContainer isLoading={submitting}>
            {inEditMode
              ? getEditorUpdateConfirmButtonLabel(schema)
              : getEditorCreateConfirmButtonLabel(schema)}
          </LoaderContainer>
        </Button>
        <Button bsSize="large" disabled={submitting} onClick={onCancel}>
          {inEditMode
            ? getEditorUpdateAbortButtonLabel(schema)
            : getEditorCreateAbortButtonLabel(schema)}
        </Button>
      </ButtonToolbar>
      {error && (
        <div className="has-error">
          <HelpBlock>{error}</HelpBlock>
        </div>
      )}
    </form>
  );
}

ResourceForm.propTypes = {
  schema: PropTypes.object,
  assetManager: PropTypes.object,
  handleSubmit: PropTypes.func,
  touch: PropTypes.func,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  fields: PropTypes.object,
  onCancel: PropTypes.func,
  error: PropTypes.string,
  places: PropTypes.array,
};

export function resolveResourceForm(schema) {
  const formKey = _.get(schema, 'name', 'resource');
  const propertyKeys = getSchemaPropertyKeys(schema);

  return reduxForm({
    getFormState,
    form: formKey,
    fields: ['id', ...propertyKeys],
    validate: resource => validateResourceForm(schema, resource),
  })(ResourceForm);
}
