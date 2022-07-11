from odoo import models, fields


class TestCrndWebModelBook(models.Model):
    _name = 'test.crnd.web.model.book'
    _description = 'Test model for crnd_web_on_create_action'

    title = fields.Char(readonly=True)
