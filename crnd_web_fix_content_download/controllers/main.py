import logging
import base64
from io import BytesIO

import werkzeug
from werkzeug.wsgi import wrap_file

from odoo import http
from odoo.addons.web.controllers.main import Binary, binary_content

_logger = logging.getLogger(__name__)


class BinaryExtension(Binary):

    # pylint: disable=redefined-builtin,too-many-locals
    @http.route()
    def content_common(self, xmlid=None, model='ir.attachment', id=None,
                       field='datas', filename=None,
                       filename_field='datas_fname', unique=None,
                       mimetype=None, download=None, data=None, token=None,
                       access_token=None, related_id=None, access_mode=None,
                       **kw):
        status, headers, content = binary_content(
            xmlid=xmlid, model=model, id=id, field=field, unique=unique,
            filename=filename, filename_field=filename_field,
            download=download, mimetype=mimetype, access_token=access_token,
            related_id=related_id, access_mode=access_mode)
        if status == 304:
            response = werkzeug.wrappers.Response(
                status=status, headers=headers)
        elif status == 301:
            return werkzeug.utils.redirect(content, code=301)
        elif status != 200:
            response = http.request.not_found()
        else:
            content_base64 = base64.b64decode(content)
            headers.append(('Content-Length', len(content_base64)))
            buf = BytesIO(content_base64)
            data = wrap_file(http.request.httprequest.environ, buf)
            response = http.Response(
                data,
                headers=headers,
                direct_passthrough=True)
        if token:
            response.set_cookie('fileToken', token)
        return response
