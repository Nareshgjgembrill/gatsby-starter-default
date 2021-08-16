import gql from 'graphql-tag';

export const FETCH_TAG_LIST_QUERY = gql`
  query(
    $includeAssociationsQry: String!
    $filter: String!
    $limit: String!
    $offset: String!
  ) {
    allTags(
      includeAssociationsQry: $includeAssociationsQry
      filter: $filter
      limit: $limit
      offset: $offset
    )
      @rest(
        type: "Tag"
        path: "tags?page[limit]={args.limit}&page[offset]={args.offset}"
      ) {
      data
      paging
    }
  }
`;

export const FETCH_TAG_LIST = gql`
  query(
    $includeAssociationsQry: String!
    $filter: String!
    $limit: String!
    $offset: String!
  ) {
    dropdownData(
      includeAssociationsQry: $includeAssociationsQry
      filter: $filter
      limit: $limit
      offset: $offset
    )
      @rest(
        type: "Tag"
        path: "tags?page[limit]={args.limit}&page[offset]={args.offset}&sort[name]=asc"
      ) {
      data
      paging
    }
  }
`;

export const FETCH_TAG_QUERY = gql`
  query($id: ID!, $limit: String!, $offset: String!) {
    tag(id: $id, limit: $limit, offset: $offset)
      @rest(
        type: "Tag"
        path: "tags/:id?page[limit]={args.limit}&page[offset]={args.offset}"
      ) {
      data
      paging
    }
  }
`;

export const FETCH_EMAIL_TEMPLATES_LIST_QUERY = gql`
  query(
    $filter: String!
    $limit: String!
    $offset: String!
    $sortBy: String!
    $orderBy: String!
  ) {
    templates(
      filter: $filter
      limit: $limit
      offset: $offset
      sortBy: $sortBy
      orderBy: $orderBy
    )
      @rest(
        type: "Templates"
        path: "emailTemplates?includeAssociations[]=tag&page[limit]={args.limit}&page[offset]={args.offset}{args.filter}&filter[status]=true&sort[{args.sortBy}]={args.orderBy}"
      ) {
      data
      paging
      includedAssociations
    }
  }
`;

export const FETCH_EMAIL_TEMPLATES_LIST = gql`
  query($filter: String!, $limit: String!, $offset: String!) {
    dropdownData(filter: $filter, limit: $limit, offset: $offset)
      @rest(
        type: "Templates"
        path: "emailTemplates?page[limit]={args.limit}&page[offset]={args.offset}{args.filter}&filter[status]=true&sort[name]=asc"
      ) {
      data
      paging
      includedAssociations
    }
  }
`;

export const FETCH_CATEGORIES_LIST_QUERY = gql`
  query($includeAssociationsQry: String!, $limit: String!, $offset: String!) {
    categories(
      includeAssociationsQry: $includeAssociationsQry
      limit: $limit
      offset: $offset
    )
      @rest(
        type: "Categories"
        path: "emailTemplates/category?page[limit]={args.limit}&page[offset]={args.offset}"
      ) {
      data
      paging
    }
  }
`;

export const FETCH_CATEGORIES_LIST = gql`
  query($includeAssociationsQry: String!, $limit: String!, $offset: String!) {
    dropdownData(
      includeAssociationsQry: $includeAssociationsQry
      limit: $limit
      offset: $offset
    )
      @rest(
        type: "Categories"
        path: "emailTemplates/category?page[limit]={args.limit}&page[offset]={args.offset}"
      ) {
      data
      paging
    }
  }
`;

export const FETCH_CATEGORIES_TEMPLATES = gql`
  query($lookupName: String!) {
    templateCategories(lookupName: $lookupName)
      @rest(
        type: "lookUps"
        path: "lookUps?filter[lookupName]={args.lookupName}"
      ) {
      data
      paging
    }
  }
`;

export default FETCH_TAG_LIST_QUERY;
