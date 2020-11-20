import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import i18next from 'i18next';
import { ConfirmModal, NestedSortable } from '@shoutem/react-web-ui';
import CategoryNameModal from '../category-name-modal';
import CategoryTreeItem from '../category-tree-item';
import './style.scss';

const CREATE_CATEGORY_TEMPLATE = {
  id: '@@categoryTree/create',
  icon: 'add',
  className: 'category-tree__create-category',
  isStatic: true,
};

function generateTree(categories, staticCategories, categoryActionWhitelist) {
  const categoryTree = _.map(categories, category => ({
    id: category.id,
    actionWhitelist: _.get(categoryActionWhitelist, category.id, []),
    name: category.name,
    isStatic: _.includes(staticCategories, category.id),
  }));

  return [...categoryTree, CREATE_CATEGORY_TEMPLATE];
}

export default class CategoryTree extends Component {
  static propTypes = {
    categories: PropTypes.array,
    categoryActionWhitelist: PropTypes.object,
    staticCategories: PropTypes.array,
    selectedCategoryId: PropTypes.string,
    onCategorySelected: PropTypes.func,
    onCategoryUpdate: PropTypes.func,
    onCategoryCreate: PropTypes.func,
    onCategoryDelete: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.refreshData = this.refreshData.bind(this);
    this.handleCategorySelected = this.handleCategorySelected.bind(this);
    this.handleCategoryRenameClick = this.handleCategoryRenameClick.bind(this);
    this.handleCategoryDeleteClick = this.handleCategoryDeleteClick.bind(this);
    this.renderCategoryItem = this.renderCategoryItem.bind(this);
  }

  componentWillMount() {
    this.refreshData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.refreshData(nextProps, this.props);
  }

  refreshData(nextProps, props = {}) {
    const { categories } = props;
    const {
      categories: nextCategories,
      categoryActionWhitelist,
      staticCategories: nextStaticCategories,
    } = nextProps;

    if (!_.isEqual(nextCategories, categories)) {
      const tree = generateTree(
        nextCategories,
        nextStaticCategories,
        categoryActionWhitelist,
      );
      this.setState({ tree });
    }
  }

  handleCategorySelected(categoryId) {
    if (categoryId !== CREATE_CATEGORY_TEMPLATE.id) {
      this.props.onCategorySelected(categoryId);
    } else {
      this.refs.categoryNameModal.show();
    }
  }

  handleCategoryRenameClick(category) {
    this.refs.categoryNameModal.show(category);
  }

  handleCategoryDeleteClick(category) {
    const { id, name } = category;

    this.refs.confirm.show({
      title: i18next.t('Delete category'),
      message: i18next.t('Are you sure you want to delete this category?'),
      confirmLabel: i18next.t('Delete'),
      abortLabel: i18next.t('Cancel'),
      confirmBsStyle: 'danger',
      onConfirm: () => this.props.onCategoryDelete(id),
    });
  }

  renderCategoryItem(categoryItem) {
    return (
      <CategoryTreeItem
        category={categoryItem}
        onCategoryDeleteClick={this.handleCategoryDeleteClick}
        onCategoryRenameClick={this.handleCategoryRenameClick}
      />
    );
  }

  render() {
    const { tree } = this.state;
    const {
      selectedCategoryId,
      onCategoryUpdate,
      onCategoryCreate,
    } = this.props;

    return (
      <div>
        <NestedSortable
          className="category-tree"
          disableDropIntoRoot
          isHorizontal
          nodeHeaderTemplate={this.renderCategoryItem}
          onSelect={this.handleCategorySelected}
          selectedId={selectedCategoryId}
          tree={tree}
        />
        <ConfirmModal className="settings-page-modal-small" ref="confirm" />
        <CategoryNameModal
          onCategoryCreate={onCategoryCreate}
          onCategoryUpdate={onCategoryUpdate}
          ref="categoryNameModal"
        />
      </div>
    );
  }
}
