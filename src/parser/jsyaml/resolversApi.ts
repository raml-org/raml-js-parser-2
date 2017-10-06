
/**
 * Must provide either page content or error message
 */
export interface Response{

    /**
     * Page content
     */
    content?:string

    /**
     * Error message
     */
    errorMessage?:string

}

export interface HTTPResolver{
    /**
     * Load resource by URL synchronously
     * @param url Resource URL
     * @return Resource content in string form
     **/
    getResource(url:string):Response

    /**
     * Load resource by URL asynchronously
     * @param url Resource URL
     * @return Resource content in string form
     **/
    getResourceAsync(url:string):Promise<Response>
}

export interface FSResolver{

    /**
     * Load file content synchronosly
     * @param path File path
     * @return File content as string
     **/
    content(path:string):string

    /**
     * Load file content asynchronosly
     * @param path File path
     * @return File content as string
     **/
    contentAsync(path:string):Promise<string>
}