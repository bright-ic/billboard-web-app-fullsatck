import { Request, Response } from 'express';
import BaseController from './base';
import BlogService from '../services/Blog.service';
import errorMessages from '../lib/error-messages';
import { DynamicObject } from '../types/Types';


class BlogController extends BaseController {

    postAddUpdateBlog = async (req: Request, res: Response) => {
        try {
            const postBody = {...req.body};
            const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined; // Get the file path
            postBody.image = imageUrl;
            const result = await BlogService.addUpdateBlogPost(postBody);
            if(!result.success) {
                return BaseController.sendFailResponse(res, result.data || errorMessages.genetic_Error)
            }
            return BaseController.sendSuccessResponse(res, result.data);
        } catch(e) {
            console.log(e);
            return BaseController.sendFailResponse(res, errorMessages.server_error)
        }
    }

    getAllBlogPosts = async (req: Request, res: Response) => {
        try {
            const query: any | DynamicObject = req.query;
            const result = await BlogService.getBlogPosts(query);
            if(!result.success) {
                return BaseController.sendFailResponse(res, result.data || errorMessages.genetic_Error)
            }
            return BaseController.sendSuccessResponse(res, result.data);
        } catch(e) {
            console.log(e);
            return BaseController.sendFailResponse(res, errorMessages.server_error)
        }
    }

    getBlogPost= async (req: Request, res: Response) => {
        try {
            const result = await BlogService.getBlogPost(req.params?.slug || req.params?.id || "");
            if(!result.success) {
                return BaseController.sendFailResponse(res, result.data || errorMessages.genetic_Error)
            }
            return BaseController.sendSuccessResponse(res, result.data);
        } catch(e) {
            console.log(e);
            return BaseController.sendFailResponse(res, errorMessages.server_error)
        }
    }

    deleteBlogPost = async (req: Request, res: Response) => {
        try {
            const result = await BlogService.deleteBlogPost(req.params?.slug || req.params?.id || "");
            if(!result.success) {
                return BaseController.sendFailResponse(res, result.data || errorMessages.genetic_Error)
            }
            return BaseController.sendSuccessResponse(res, result.data);
        } catch(e) {
            console.log(e);
            return BaseController.sendFailResponse(res, errorMessages.server_error)
        }
    }

    postAddUpdateCategory = async (req: Request, res: Response) => {
        try {
            const result = await BlogService.addUpdateBlogPost({...req.body});
            if(!result.success) {
                return BaseController.sendFailResponse(res, result.data || errorMessages.genetic_Error)
            }
            return BaseController.sendSuccessResponse(res, result.data);
        } catch(e) {
            console.log(e);
            return BaseController.sendFailResponse(res, errorMessages.server_error)
        }
    }

    getAllCategories = async (req: Request, res: Response) => {
        try {
            const query: any | DynamicObject = req.query;
            const result = await BlogService.getCategories(query);
            if(!result.success) {
                return BaseController.sendFailResponse(res, result.data || errorMessages.genetic_Error)
            }
            return BaseController.sendSuccessResponse(res, result.data);
        } catch(e) {
            console.log(e);
            return BaseController.sendFailResponse(res, errorMessages.server_error)
        }
    }

    getCategory = async (req: Request, res: Response) => {
        try {
            const result = await BlogService.getCategory(req.params?.slug || req.params?.id || "");
            if(!result.success) {
                return BaseController.sendFailResponse(res, result.data || errorMessages.genetic_Error)
            }
            return BaseController.sendSuccessResponse(res, result.data);
        } catch(e) {
            console.log(e);
            return BaseController.sendFailResponse(res, errorMessages.server_error)
        }
    }

    deleteCategory = async (req: Request, res: Response) => {
        try {
            const result = await BlogService.deleteCategory(req.params?.slug || req.params?.id || "");
            if(!result.success) {
                return BaseController.sendFailResponse(res, result.data || errorMessages.genetic_Error)
            }
            return BaseController.sendSuccessResponse(res, result.data);
        } catch(e) {
            console.log(e);
            return BaseController.sendFailResponse(res, errorMessages.server_error)
        }
    }
}

export default BlogController;