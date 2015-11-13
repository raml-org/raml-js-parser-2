/**
 * Definitions for HAR 1.2 ( Http Archive Format )
 * http://www.softwareishard.com/blog/har-12-spec/
 */
declare module har {

    interface Commentable {
        comment? : string
    }

    interface Log extends Commentable {
        /**
         * Version number of the format. If empty, string "1.1" is assumed by default.
         */
        version? : string // "1.2",

        /**
         * Name and version info of the log creator application.
         */
        creator? : Creator // {},

        /**
         * Name and version info of used browser.
         */
        browser? : Browser

        /**
         *  List of all exported (tracked) pages. Leave out this field if the application does not support grouping by pages
         */
        pages?   : Page[]

        /**
         * List of all exported (tracked) requests.
         */
        entries? : Entry[]
    }

    interface Creator extends Commentable {
        name?:    string // "Firebug",
        version?: string // "1.6",
    }

    interface Browser extends Commentable{
        name?:    string // "Firefox",
        version?: string // "3.6",
    }


    interface Page extends Commentable {
        /**
         * Date and time stamp for the beginning of the page load
         * (ISO 8601 - YYYY-MM-DDThh:mm:ss.sTZD, e.g. 2009-07-24T19:20:30.45+01:00).
         */
        startedDateTime?:  ISO8601TimeString

        /**
         * Unique identifier of a page within the <log>. Entries use it to refer the parent page
         */
        id? : string // "page_0",

        /**
         *  Page title.
         */
        title?: string // "Test Page",

        /**
         *  Detailed timing info about page load.
         */
        pageTimings?: PageTiming[]  // {...},

    }

    /**
     * This object describes timings for various events (states) fired during the page load.
     * All times are specified in milliseconds.
     * If a time info is not available appropriate field is set to -1.
     */
    interface PageTiming {
        /**
         *  Content of the page loaded.
         *  Number of milliseconds since page load started (page.startedDateTime).
         *  Use -1 if the timing does not apply to the current request.
         */
        onContentLoad?: number // 1720,

        /**
         * Page is loaded (onLoad event fired).
         * Number of milliseconds since page load started (page.startedDateTime).
         * Use -1 if the timing does not apply to the current request.
         */
        onLoad?: number // 2500,
    }

    /**
     * This object represents an array with all exported HTTP requests.
     * Sorting entries by startedDateTime (starting from the oldest) is preferred way how to export data since it can make importing faster.
     * However the reader application should always make sure the array is sorted (if required for the import).
     */
    interface Entry extends Commentable {
        /**
         * unique
         * Reference to the parent page.
         * Leave out this field if the application does not support grouping by pages.
         */
        pageref?: string // "page_0",

        /**
         * Date and time stamp of the request start (ISO 8601 - YYYY-MM-DDThh:mm:ss.sTZD).
         */
        startedDateTime?: ISO8601TimeString

        /**
         * Total elapsed time of the request in milliseconds.
         * This is the sum of all timings available in the timings object (i.e. not including -1 values)
         */
        time?: number // 50

        /**
         * Detailed info about the request.
         */
        request?: Request // {...},

        /**
         * Detailed info about the response
         */
        response?: Response // {...},

        /**
         * Info about cache usage.
         */
        cache?: Cache

        /**
         * Detailed timing info about request/response round trip.
         */
        timings?: EntryTiming

        /**
         * IP address of the server that was connected (result of DNS resolution).
         */
        serverIPAddress?: IPAddressString // "10.0.0.1",

        /**
         * Unique ID of the parent TCP/IP connection, can be the client or server port number.
         * Note that a port number doesn't have to be unique identifier in cases where the port is shared for more connections.
         * If the port isn't available for the application, any other unique connection ID can be used instead (e.g. connection index).
         * Leave out this field if the application doesn't support this info.
         */
        connection?: string // "52492",
    }

    interface Cache extends Commentable {
        beforeRequest?: CacheEntry
        afterRequest?:  CacheEntry
    }

    interface CacheEntry extends Commentable {
        /**
         * Expiration time of the cache entry.
         */
        expires?:       ISO8601TimeString

        /**
         * The last time the cache entry was opened.
         */
        lastAccess?:    ISO8601TimeString

        eTag?:          string

        /**
         * The number of times the cache entry has been opened.
         */
        hitCount?:      number // 0
    }

    interface Request extends Commentable {
        /**
         * Request method (GET, POST, ...).
         */
        method?: string // "GET",

        /**
         * Absolute URL of the request (fragments are not included).
         */
        url?: string // "http://www.example.com/path/?param=value",

        /**
         * Request HTTP Version.
         */
        httpVersion?: string // "HTTP/1.1",

        /**
         * List of cookie objects.
         */
        cookies?: Cookie[]

        /**
         * List of header objects.
         */
        headers?: Header[]

        /**
         *  List of query parameter objects.
         */
        queryString? : QueryParameter[]

        /**
         * osted data info.
         */
        postData? : PostData

        /**
         * Total number of bytes from the start of the HTTP request message until (and including)
         * the double CRLF before the body. Set to -1 if the info is not available.
         */
        headersSize? : number

        /**
         * Size of the request body (POST data payload) in bytes.
         * Set to -1 if the info is not available.
         */
        bodySize? : number

    }

    interface Response extends Commentable {
        /**
         * Response status.
         */
        status?: number // 200,
        /**
         * Response status description.
         */
        statusText?: string // "OK"

        /**
         * Response HTTP Version.
         */
        httpVersion?: string // "HTTP/1.1",

        /**
         *
         */
        cookies?: Cookie[]// [],
        headers?: Header[]

        /**
         * Details about the response body.
         */
        content?: Content

        /**
         * Redirection target URL from the Location response header.
         */
        redirectURL?: string // "",

        /**
         * Total number of bytes from the start of the HTTP response message until (and including) the double CRLF before the body.
         * Set to -1 if the info is not available.
         *
         * The size of received response-headers is computed only from headers that are really received from the server.
         * Additional headers appended by the browser are not included in this number, but they appear in the list of header objects.
         *
         * The total response size received can be computed as follows (if both values are available):
         *
         * var totalSize = entry.response.headersSize + entry.response.bodySize;
         */
        headersSize? : number // 160,

        /**
         * Size of the received response body in bytes.
         * Set to zero in case of responses coming from the cache (304).
         * Set to -1 if the info is not available.
         */
        bodySize? : number // 850,
    }


    interface Cookie extends Commentable {
        /**
         * The name of the cookie.
         */
        name?: string // "TestCookie",
        /**
         * The cookie value.
         */
        value?: string // "Cookie Value",

        /**
         * The path pertaining to the cookie.
         */
        path?: string //"/",

        /**
         * The host of the cookie.
         */
        domain?: string // "www.janodvarko.cz",

        /**
         * Cookie expiration time. (ISO 8601 - YYYY-MM-DDThh:mm:ss.sTZD, e.g. 2009-07-24T19:20:30.123+02:00).
         */
        expires?: ISO8601TimeString // "2009-07-24T19:20:30.123+02:00",

        /**
         * Set to true if the cookie is HTTP only, false otherwise.
         */
        httpOnly?: boolean // false,

        /**
         * True if the cookie was transmitted over ssl, false otherwise.
         */
        secure?: boolean //false,
    }


    interface Header extends Commentable {
        name:  string // "Accept-Encoding",
        value: string // "gzip,deflate",
    }

    /**
     * This object contains list of all parameters & values parsed from a query string, if any (embedded in <request> object).
     * HAR format expects NVP (name-value pairs) formatting of the query string.
     */
    interface QueryParameter extends Commentable {
        name: string // "param1",
        value: string // "value1",
    }


    interface PostData extends Commentable {
        /**
         * Mime type of posted data.
         */
        mimeType?: string // "multipart/form-data",

        /**
         * List of posted parameters (in case of URL encoded parameters).
         */
        params?: PostDataParam[]// [],

        /**
         * Plain text posted data
         */
        text? : string // "plain posted data",
    }

    interface PostDataParam extends Commentable {
        /**
         * name of a posted parameter.
         */
        name? : string // "paramName",

        /**
         * value of a posted parameter or content of a posted file.
         */
        value?: string // "paramValue"

        /**
         * name of a posted file.
         */
        fileName? : string // "example.pdf",

        /**
         * content type of a posted file
         */
        contentType?: string // "application/pdf",
    }


    interface EntryTiming {
        /**
         * Time spent in a queue waiting for a network connection.
         * Use -1 if the timing does not apply to the current request.
         */
        blocked?: number // 0

        /**
         * DNS resolution time. The time required to resolve a host name.
         * Use -1 if the timing does not apply to the current request.
         */
        dns?: number // -1

        /**
         * Time required to create TCP connection.
         * Use -1 if the timing does not apply to the current request.
         */
        connect?: number // 15

        /**
         * Time required to send HTTP request to the server.
         */
        send?: number // 20

        /**
         * Waiting for a response from the server.
         */
        wait?: number // 38

        /**
         * Time required to read entire response from the server (or cache).
         */
        receive?: number // 12

        /**
         * Time required for SSL/TLS negotiation.
         * If this field is defined then the time is also included in the connect field (to ensure backward compatibility with HAR 1.1).
         * Use -1 if the timing does not apply to the current request.
         */
        ssl?: number // -1
    }

    interface Content extends Commentable {
        /**
         *  Length of the returned content in bytes.
         *  Should be equal to response.bodySize if there is no compression and bigger when the content has been compressed.
         */
        size?: number // 33,

        /**
         * Number of bytes saved. Leave out this field if the information is not available.
         */
        compression?: number // 0,

        /**
         * MIME type of the response text (value of the Content-Type response header).
         * The charset attribute of the MIME type is included (if available).
         */
        mimeType?: string // "text/html; charset=utf-8",

        /**
         * Response body sent from the server or loaded from the browser cache.
         * This field is populated with textual content only.
         * The text field is either HTTP decoded text or a encoded (e.g. "base64") representation of the response body.
         * Leave out this field if the information is not available.
         */
        text?: string // "\n",


        /**
         * Encoding used for response text field e.g "base64".
         * Leave out this field if the text field is HTTP decoded (decompressed & unchunked),
         * than trans-coded from its original character set into UTF-8.
         */
        encoding?: string
    }




    /**
     * "10.0.0.1"
     */
    type IPAddressString = string

    /**
     *  (ISO 8601 - YYYY-MM-DDThh:mm:ss.sTZD, e.g. 2009-07-24T19:20:30.123+02:00).
     */
    type ISO8601TimeString = string

}

