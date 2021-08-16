import gql from 'graphql-tag';

const FETCH_ALL_SNIPPETS_QUERY = gql`
  query(
    $includeAssociationsQry: String
    $snippetFilter: String!
    $limit: String!
    $offset: String!
  ) {
    snippets(
      includeAssociationsQry: $includeAssociationsQry
      snippetFilter: $snippetFilter
      limit: $limit
      offset: $offset
    )
      @rest(
        type: "Snippets"
        path: "snippets?{args.includeAssociationsQry}&page[limit]={args.limit}&page[offset]={args.offset}{args.snippetFilter}"
      ) {
      data
      includedAssociations
      paging
    }
  }
`;

export const FETCH_SNIPPETS_COUNT_QUERY = gql`
  query($userFilter: String!, $limit: String!, $offset: String!) {
    snippets(userFilter: $userFilter, limit: $limit, offset: $offset)
      @rest(
        type: "Snippets"
        path: "snippets?page[limit]={args.limit}&page[offset]={args.offset}{args.userFilter}"
      ) {
      data
      paging
    }
  }
`;

export const CREATE_SNIPPET_QUERY = gql`
  query {
    addSnippet(input: $input)
      @rest(type: "AddSnippet", path: "snippets", method: "POST") {
      response
      data
    }
  }
`;

export const UPDATE_SNIPPET_QUERY = gql`
  query($id: ID!) {
    editSnippet(id: $id, input: $input)
      @rest(type: "EditSnippet", path: "snippets/{args.id}", method: "PUT") {
      response
      data
    }
  }
`;

export const DELETE_SNIPPET_QUERY = gql`
  query($id: ID!) {
    deleteSnippet(id: $id)
      @rest(type: "Snippet", path: "snippets/{args.id}", method: "DELETE") {
      data
      response
    }
  }
`;

export const CLONE_SNIPPET_QUERY = gql`
  query($id: ID!, $cloneSnippetName: String!) {
    cloneSnippet(id: $id, cloneSnippetName: $cloneSnippetName, input: {})
      @rest(
        type: "CloneSnippet"
        path: "snippets/{args.id}/cloneSnipet/{args.cloneSnippetName}"
        method: "PUT"
      ) {
      data
      response
    }
  }
`;

export const FETCH_SNIPPET_QUERY = gql`
  query($id: ID!) {
    snippet(id: $id)
      @rest(
        type: "Snippet"
        path: "snippets/{args.id}?includeAssociations[]=user"
      ) {
      data
      includedAssociations
    }
  }
`;

export const TAG_SNIPPET_QUERY = gql`
  query($snippetId: ID!, $input: Object!) {
    tagTemplate(snippetId: $snippetId, input: $input)
      @rest(
        type: "Snippets"
        path: "snippets/{args.snippetId}"
        method: "PUT"
      ) {
      data
      response
    }
  }
`;

export default FETCH_ALL_SNIPPETS_QUERY;
