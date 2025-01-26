

import BlogModel, { IBlog } from '../models/Blog';
import BlogCategoryModel, {ICategory} from '../models//BlogCategory';
import BaseService from "./base";
import validatePost from "../lib/validate";
import { UserInterface, CreateUpdateCategoryPayload, CategoryDocument, BlogPostPayload, BlogDocument } from '../interfaces';
import { BlogStatusEnum, DynamicObject, RoleEnum } from '../types/Types';
import errorMessages from '../lib/error-messages';
import {StandardServiceResponse} from "../types/index";
import { getMongoId, getPaginatedRecords, validMongoId } from '../lib/utils';
import { encodeHTML, decodeHTML } from 'entities';

class BlogService extends BaseService {

    
    /**
     * Method that creates  or updates existing blog  category if id field is part  of the request data
     *
     * @async
     * @param {CreateUpdateCategoryPayload} postData Request data
     * @param {(UserInterface | null)} [user=null] The session  user record
     * @returns {Promise<StandardServiceResponse>} Returns a promise with success and data fields eg {success:  boolean, data: Blog | Error}
     */
    static addUpdateCategory = async (postData: CreateUpdateCategoryPayload, user: UserInterface | null = null): Promise<StandardServiceResponse> => {
        try {
            const validation_messages: DynamicObject = {
                "required": "Your :attribute is required"
            };
            let validation_rules: DynamicObject = {
                name: 'no_html|required|string',
                description: 'no_html|required|string',
            };
            const validationResponse = await validatePost(postData, validation_rules, validation_messages);
            if(!validationResponse.success){
              return BaseService.sendFailedResponse(validationResponse.data);
            }
            const SanitizeData = BaseService.sanitizeRequestData(postData);
            const id: string = SanitizeData?.id || "";
            const { name, description, status} = SanitizeData;
            // check if category with name exist
            const checkCategory: CategoryDocument | null = await BlogCategoryModel.findOne({name: name.toLowerCase()});
            if(checkCategory && checkCategory._id && (!id || (id && id.trim() !== String(checkCategory._id)))) {
                return BaseService.sendFailedResponse({name: "A category with the supplied name already exist"})
            }
            if(id) {
                const checkCategory: CategoryDocument | null = await BlogCategoryModel.findById(id);
                if(!checkCategory || !checkCategory._id) {
                    return BaseService.sendFailedResponse({category: "Category you wish to update does not exist"});
                }
            }
            const categoryDoc: CategoryDocument= {
                name: name.toLowerCase(),
                description,
                status: status === "ACTIVE" ? status : "INACTIVE"
            };
            if(user && user._id) {
                if(!id) {
                    categoryDoc.createdBy = user._id;
                } else {
                    categoryDoc.updatedBy = user._id;
                }
            }
            let result;
            if(id) {
                result = await BlogCategoryModel.findByIdAndUpdate(id, categoryDoc);
            } else {
                const Category = new BlogCategoryModel(categoryDoc);
                result = await  Category.save();
            }
            if(!result) {
                return BaseService.sendFailedResponse({_db_error: 'An error occurred while saving your category'})
            }

            return BaseService.sendSuccessResponse(result);
        } catch(e) {
            console.log(e);
            return BaseService.sendFailedResponse(errorMessages.server_error);
        }
    }

    
    /**
     * Method that returns paginated blog category records
     *
     * @async
     * @param {({page: number, limit: number} & DynamicObject)} reqQuery Represents the request query
     * @returns {Promise<StandardServiceResponse>} Returns a promise with success and data fields eg {success:  boolean, data: Blog | Error}
     */
    static getCategories = async (reqQuery: {page: number, limit: number} & DynamicObject): Promise<StandardServiceResponse> => {
        try {
            const { page = 1, limit = 10, status, name } = reqQuery;
            const query: DynamicObject = {};
            if(status) {
                query.status = status;
            }
            if(name) {
                const searchTerms: string[] = name.split(' ').map((term: string) => term.trim()).filter(Boolean);
                const regexConditions = searchTerms.map((term: string) => ({
                    name: {$regex: term, $options: 'i'}
                }))
                query.$and = regexConditions;
            }

            return await getPaginatedRecords(BlogCategoryModel, query, {page, limit});
        } catch (err) {
            console.log(err);
            return BaseService.sendFailedResponse(errorMessages.server_error)
        }
    }

    
    /**
     * Method that fetches a single blog category by ID
     *
     * @async
     * @param {string} id The ID of  the category to fetch
     * @returns {Promise<StandardServiceResponse>} Returns a promise with success and data fields eg {success:  boolean, data: Blog | Error}
     */
    static getCategory = async (id: string): Promise<StandardServiceResponse> => {
        try {
            if(!(typeof id === "string" && id.trim() === "" && validMongoId(id))) {
                return BaseService.sendFailedResponse({id: 'Missing or invalid  required param "id"'})
            }
            const category: ICategory | null = await BlogCategoryModel.findById(id);
            if(!category || !category._id) {
                return BaseService.sendFailedResponse({category: "Category with id not found"})
            }
            return BaseService.sendSuccessResponse(category)
        } catch (err) {
            console.log(err);
            return BaseService.sendFailedResponse(errorMessages.server_error)
        }
    }

    
    /**
     * Method that deletes a blog category by ID
     *
     * @async
     * @param {string} id The ID of the  blog category to be deleted
     * @returns {Promise<StandardServiceResponse>} Returns a promise with success and data fields eg {success:  boolean, data: Blog | Error}
     */
    static deleteCategory = async (id: string): Promise<StandardServiceResponse> => {
        try {
            if(!(typeof id === "string" && id.trim() === "" && validMongoId(id))) {
                return BaseService.sendFailedResponse({id: 'Missing or invalid  required param "id"'})
            }
            const category: ICategory | null = await BlogCategoryModel.findById(id);
            if(!category || !category._id) {
                return BaseService.sendFailedResponse({category: "Category with id not found"})
            }
            const result = await BlogCategoryModel.findByIdAndDelete(id);
            if(!result) {
                return BaseService.sendFailedResponse({error: "Failed to delete category. Try again later"})
            }
            return BaseService.sendSuccessResponse({message: "Category was successfully deleted"})
        } catch(e) {
            console.log(e);
            return BaseService.sendFailedResponse(errorMessages.server_error)
        }
    }

    
    /**
     *  Method that creates or updates blog/article if id field is part of the request data
     *
     * @async
     * @param {BlogPostPayload} postData Request data
     * @param {(UserInterface | null)} [user=null] The session user data
     * @returns {Promise<StandardServiceResponse>} Returns a promise with success and data fields eg {success:  boolean, data: Blog | Error}
     */
    static addUpdateBlogPost = async (postData: BlogPostPayload, user: UserInterface | null = null): Promise<StandardServiceResponse> => {
        try {
            const validation_messages: DynamicObject = {
                "required": "Your :attribute is required"
            };
            let validation_rules: DynamicObject = {
                title: 'no_html|required|string',
                category: 'no_html|required|string',
                content: 'string|required',
                status: 'no_html|string|required'
            };
            const validationResponse = await validatePost(postData, validation_rules, validation_messages);
            if(!validationResponse.success){
              return BaseService.sendFailedResponse(validationResponse.data);
            }
            const SanitizeData = BaseService.sanitizeRequestData(postData);
            const id: string = SanitizeData?.id || "";
            const { title, category, content, status, thumbnail} = SanitizeData;
            // check if blog category id exist
            const checkCategory: CategoryDocument | null = await BlogCategoryModel.findById(category);
            if(!checkCategory || !checkCategory._id) {
                return BaseService.sendFailedResponse({category: "The category you selected does not exist"})
            }
            if(id) {
                const checkBlog: IBlog | null = await BlogModel.findById(id);
                if(!checkBlog || !checkBlog._id) {
                    return BaseService.sendFailedResponse({blog: "Blog post you wish to update does not exist"});
                }
            }
            const blogDoc: BlogDocument= {
                title,
                content: encodeHTML(content),
                category: checkCategory._id,
                status: status === BlogStatusEnum.ACTIVE ? BlogStatusEnum.ACTIVE : BlogStatusEnum.INACTIVE
            };
            if(user && user._id) {
                if(id) {
                    blogDoc.updatedBy = user._id;
                } else {
                    blogDoc.author = user._id;
                }
            }
            if(thumbnail) {
                blogDoc.thumbnail = thumbnail;
            }
            let result;
            if(id) {
                result = await BlogModel.findByIdAndUpdate(id, blogDoc);
            } else {
                const Category = new BlogModel(blogDoc);
                result = await  Category.save();
            }
            if(!result) {
                return BaseService.sendFailedResponse({_db_error: 'An error occurred while saving your blog post'})
            }

            return BaseService.sendSuccessResponse(result);
        } catch(e) {
            console.log(e);
            return BaseService.sendFailedResponse(errorMessages.server_error);
        }
    }

    
    /**
     * Method that fetches paginated blog/article records
     *
     * @async
     * @param {({page: number, limit: number} & DynamicObject)} reqQuery Represents request query
     * @returns {Promise<StandardServiceResponse>} Returns a promise with success and data fields eg {success:  boolean, data: Blog | Error}
     */
    static getBlogPosts = async (reqQuery: {page: number, limit: number} & DynamicObject): Promise<StandardServiceResponse> => {
        try {
            const { page = 1, limit = 10, status, search } = reqQuery;
            const query: DynamicObject = {};
            if(status) {
                query.status = status;
            }
            if(search && typeof search === "string" && search.trim() !== "") {
                const searchTerms: string[] = search.trim().split(' ').map((term: string) => term.trim()).filter(Boolean);
                const regexConditions = searchTerms.map((term: string) => ({
                    title: {$regex: term, $options: 'i'}
                }))
                query.$and = regexConditions;
            }

            return await getPaginatedRecords(BlogModel, query, {page, limit});
        } catch (err) {
            console.log(err);
            return BaseService.sendFailedResponse(errorMessages.server_error)
        }
    }

    
    /**
     * Method that fetches a single blog post/article by id or slug
     *
     * @async
     * @param {string} idOrSlug Represents the ID or slug of the post to fetch
     * @returns {Promise<StandardServiceResponse>} Returns a promise with success and data fields eg {success:  boolean, data: Blog | Error}
     */
    static getBlogPost = async (idOrSlug: string): Promise<StandardServiceResponse> => {
        try {
            if(!(typeof idOrSlug === "string" && idOrSlug.trim() === "")) {
                return BaseService.sendFailedResponse({id: 'Missing or invalid  required param "id"'})
            }
            let query: DynamicObject = {};
            if(validMongoId(idOrSlug)) {
                query._id = getMongoId(idOrSlug);
            } else {
                query.slug = idOrSlug;
            }
            const blog: IBlog | null = await BlogModel.findOne(query);
            if(!blog || !blog._id) {
                return BaseService.sendFailedResponse({blog: "Article with id not found"})
            }
            return BaseService.sendSuccessResponse(blog)
        } catch (err) {
            console.log(err);
            return BaseService.sendFailedResponse(errorMessages.server_error)
        }
    }

    
    /**
     * Method that deletes a blog post by ID
     *
     * @async
     * @param {string} id Represents the ID of the blog post to delete
     * @returns {Promise<StandardServiceResponse>} Returns a promise with success and data fields eg {success:  boolean, data: Blog | Error}
     */
    static deleteBlogPost = async (id: string): Promise<StandardServiceResponse> => {
        try {
            if(!(typeof id === "string" && id.trim() === "" && validMongoId(id))) {
                return BaseService.sendFailedResponse({id: 'Missing or invalid  required param "id"'})
            }
            const blog: IBlog | null = await BlogModel.findById(id);
            if(!blog || !blog._id) {
                return BaseService.sendFailedResponse({blog: "Article with id not found"})
            }
            const result = await BlogCategoryModel.findByIdAndDelete(id);
            if(!result) {
                return BaseService.sendFailedResponse({error: "Failed to delete Article. Try again later"})
            }
            return BaseService.sendSuccessResponse({message: "Article was successfully deleted"})
        } catch(e) {
            console.log(e);
            return BaseService.sendFailedResponse(errorMessages.server_error)
        }
    }
}

export default BlogService;