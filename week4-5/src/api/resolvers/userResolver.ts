import {GraphQLError} from 'graphql';
import {UserInput, User} from '../../types/DBTypes';
import fetchData from '../../functions/fetchData';
import {LoginResponse} from '../../types/MessageTypes';
import {MyContext} from '../../types/MyContext';
import {Credentials, UserModify} from '../../types/UserTypes';

// TODO: create resolvers based on user.graphql
// note: when updating or deleting a user don't send id to the auth server, it will get it from the token. So token needs to be sent with the request to the auth server
// note2: when updating or deleting a user as admin, you need to send user id (dont delete admin btw) and also check if the user is an admin by checking the role from the user object form context

export default {
  Query: {
    users: async () => {
      const users: User[] = await fetchData(process.env.AUTH_URL + '/users', {
        method: 'GET',
      });
      return users;
    },
    userById: async (_: undefined, {id}: {id: string}) => {
      const user: User = await fetchData(
        process.env.AUTH_URL + '/users/' + id,
        {method: 'GET'},
      );
      return user;
    },
    checkToken: async (_: undefined, __: {}, context: MyContext) => {
      if (!context.userdata) {
        throw new GraphQLError('Token not valid', {extensions: {code: 403}});
      }
      return context.userdata.user;
    },
  },
  Mutation: {
    login: async (_: undefined, {credentials}: {credentials: Credentials}) => {
      const data: LoginResponse = await fetchData(
        process.env.AUTH_URL + '/auth/login',
        {
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
          method: 'POST',
        },
      );
      return data;
    },
    register: async (_: undefined, {user}: {user: UserInput}) => {
      const createdResponse: {id: string; message: string} | undefined =
        await fetchData(process.env.AUTH_URL + '/users', {
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
          method: 'POST',
        });
      return createdResponse;
    },
    updateUser: async (
      _: undefined,
      {user}: {user: UserModify},
      context: MyContext,
    ) => {
      if (!context.userdata) {
        throw new GraphQLError('Unauthorized', {extensions: {code: 403}});
      }

      const update = await fetchData(process.env.AUTH_URL + '/users', {
        headers: {
          Authorization: `Bearer ${context.userdata.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
        method: 'PUT',
      });
      return update;
    },
    deleteUser: async (_: undefined, __: {}, context: MyContext) => {
      if (!context.userdata) {
        throw new GraphQLError('Unauthorized', {extensions: {code: 403}});
      }
      console.error(context.userdata.user);
      return await fetchData(
        process.env.AUTH_URL + `/users?id=${context.userdata.user.id}`,
        {
          headers: {
            Authorization: `Bearer ${context.userdata.token}`,
          },
          method: 'DELETE',
        },
      );
    },
    updateUserAsAdmin: async (
      _: undefined,
      {id, data}: {id: string; data: UserModify},
      context: MyContext,
    ) => {
      if (context.userdata?.user.role !== 'admin') {
        throw new GraphQLError('Unauthorized', {extensions: {code: 403}});
      }
      return await fetchData(process.env.AUTH_URL + '/users/' + id, {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        method: 'POST',
      });
    },
    deleteUserAsAdmin: async (
      _: undefined,
      {id}: {id: string},
      context: MyContext,
    ) => {
      if (context.userdata?.user.role !== 'admin') {
        throw new GraphQLError('Unauthorized', {extensions: {code: 403}});
      }
      return await fetchData(process.env.AUTH_URL + `/users?id=${id}`, {
        headers: {
          Authorization: `Bearer ${context.userdata.token}`,
        },
        method: 'DELETE',
      });
    },
  },
};
