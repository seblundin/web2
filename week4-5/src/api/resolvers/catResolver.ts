// import {GraphQLError} from 'graphql';
import catModel from '../models/catModel';
import {LocationInput} from '../../types/DBTypes';
import {MyContext} from '../../types/MyContext';
import {CatInput, CatModify} from '../../types/CatTypes';
// import mongoose from 'mongoose';

// TODO: create resolvers based on cat.graphql
// note: when updating or deleting a cat, you need to check if the user is the owner of the cat
// note2: when updating or deleting a cat as admin, you need to check if the user is an admin by checking the role from the user object
// note3: updating and deleting resolvers should be the same for users and admins. Use if statements to check if the user is the owner or an admin

export default {
  Query: {
    catById: async (_: undefined, {id}: {id: string}) => {
      const cat = await catModel.findById(id);
      const catObject = cat ? cat.toJSON() : null;
      return catObject;
    },
    cats: async () => {
      try {
        return await catModel.find();
      } catch (error) {
        console.error(error);
      }
    },
    catsByArea: async (_: undefined, {topRight, bottomLeft}: LocationInput) => {
      // Fetch cats within the specified area
      return await catModel.find({
        'location.coordinates.0': {$gte: bottomLeft.lat, $lte: topRight.lat},
        'location.coordinates.1': {$gte: bottomLeft.lng, $lte: topRight.lng},
      });
    },
    catsByOwner: async (_: undefined, {ownerId}: {ownerId: string}) => {
      return catModel.find({owner: ownerId});
    },
  },
  Mutation: {
    createCat: async (
      _: undefined,
      {input}: {input: CatInput},
      context: MyContext,
    ) => {
      try {
        const cat = await new catModel({
          ...input,
          owner: context.userdata?.user,
        }).save();
        return cat;
      } catch (error) {
        console.error(error);
      }
    },
    updateCat: async (
      _: undefined,
      {id, input}: {id: string; input: CatModify},
      context: MyContext,
    ) => {
      const cat = await catModel.findById(id);
      if (!cat) {
        throw new Error('Cat not found');
      }
      // Check if the user is the owner or an admin
      if (
        context.userdata?.user.id !== cat.owner.id.toString() &&
        context.userdata?.user.role !== 'admin'
      ) {
        throw new Error("You don't have permission to update this cat");
      }
      // Update cat fields
      Object.assign(cat, input);
      await cat.save();
      return cat;
    },
    deleteCat: async (_: undefined, {id}: {id: string}, context: MyContext) => {
      const cat = await catModel.findById(id);
      if (!cat) {
        throw new Error('Cat not found');
      }
      // Check if the user is the owner or an admin
      if (
        context.userdata?.user.id !== cat.owner.id.toString() &&
        context.userdata?.user.role !== 'admin'
      ) {
        throw new Error("You don't have permission to delete this cat");
      }
      const result = await catModel.deleteOne({_id: id});
      return result.deletedCount === 1 ? cat : null;
    },
  },
};
