from odoo import models, fields


class WizardBookCreate(models.TransientModel):
    _name = 'book.wizard.create'
    _description = 'Book wizard: Create'

    title = fields.Char()

    def create_book(self):
        self.ensure_one()
        self.env['test.crnd.web.model.book'].create({
            'title': self.title
        })
        return {
            'type': 'ir.actions.client',
            'tag': 'reload',
        }
