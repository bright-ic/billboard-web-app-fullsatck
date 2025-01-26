import express, { Request, Response } from 'express';
import BlogController from '../controllers/Blog.controller';
import upload from '../lib/upload';
import { 
    ROUTE_BLOG, 
    ROUTE_BLOG_CATEGORY,
    ROUTE_BLOG_CATEGORY_GET, 
    ROUTE_BLOG_CATEGORY_GET_ALL,
    ROUTE_BLOG_GET, ROUTE_BLOG_GET_ALL
} from '../lib/route-constants';

const router = express.Router();

// blog category
router.post(ROUTE_BLOG_CATEGORY, async(Req: Request, Res: Response) => {
    const blogController = new BlogController(Req);
    return await blogController.postAddUpdateCategory(Req, Res);
});

router.patch(ROUTE_BLOG_CATEGORY, async(Req: Request, Res: Response) => {
    const blogController = new BlogController(Req);
    return await blogController.postAddUpdateCategory(Req, Res);
});

router.get(ROUTE_BLOG_CATEGORY_GET_ALL, async(Req: Request, Res: Response) => {
    const blogController = new BlogController(Req);
    return await blogController.getAllCategories(Req, Res);
});

router.get(ROUTE_BLOG_CATEGORY_GET, async(Req: Request, Res: Response) => {
    const blogController = new BlogController(Req);
    return await blogController.getCategory(Req, Res);
});

router.delete(ROUTE_BLOG_CATEGORY_GET, async(Req: Request, Res: Response) => {
    const blogController = new BlogController(Req);
    return await blogController.deleteCategory(Req, Res);
});

// Blog posts
router.post(ROUTE_BLOG, upload.single('thumbnail'), async(Req: Request, Res: Response) => {
    const blogController = new BlogController(Req);
    return await blogController.postAddUpdateBlog(Req, Res);
});

router.patch(ROUTE_BLOG, upload.single('thumbnail'), async(Req: Request, Res: Response) => {
    const blogController = new BlogController(Req);
    return await blogController.postAddUpdateBlog(Req, Res);
});

router.get(ROUTE_BLOG_GET_ALL, async(Req: Request, Res: Response) => {
    const blogController = new BlogController(Req);
    return await blogController.getAllBlogPosts(Req, Res);
});

router.get(ROUTE_BLOG_GET, async(Req: Request, Res: Response) => {
    const blogController = new BlogController(Req);
    return await blogController.getBlogPost(Req, Res);
});

router.delete(ROUTE_BLOG_GET, async(Req: Request, Res: Response) => {
    const blogController = new BlogController(Req);
    return await blogController.deleteBlogPost(Req, Res);
});

export default router;