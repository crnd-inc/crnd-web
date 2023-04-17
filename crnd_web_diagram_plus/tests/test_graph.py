import logging

from odoo.tests.common import TransactionCase

from ..tools.graph import Graph

_logger = logging.getLogger(__name__)


class TestGraph(TransactionCase):

    def test_graph_simple(self):
        starting_node = ['profile']  # put here nodes with flow_start=True
        nodes = [
            'project', 'account', 'hr', 'base', 'product', 'mrp',
            'test', 'profile',
        ]
        transitions = [
            ('profile', 'mrp'),
            ('mrp', 'project'),
            ('project', 'product'),
            ('mrp', 'hr'),
            ('mrp', 'test'),
            ('project', 'account'),
            ('project', 'hr'),
            ('product', 'base'),
            ('account', 'product'),
            ('account', 'test'),
            ('account', 'base'),
            ('hr', 'base'),
            ('test', 'base')
        ]

        radius = 20
        g = Graph(nodes, transitions)
        g.process(starting_node)
        g.scale(radius * 3, radius * 3, radius, radius)

        result = g.result_get()
        # _logger.info("graph-result: %r", result)
        self.assertEqual(result['profile'], {'y': 100.0, 'x': 20, 'mark': 1})
        self.assertEqual(result['mrp'], {'y': 108.0, 'x': 100, 'mark': 1})
        self.assertEqual(result['project'], {'y': 108.0, 'x': 180, 'mark': 1})
        self.assertEqual(result['product'], {'y': 180.0, 'x': 340, 'mark': 1})
        self.assertEqual(result['base'], {'y': 108.0, 'x': 420, 'mark': 1})
        self.assertEqual(result['account'], {'y': 20.0, 'x': 260, 'mark': 1})
        self.assertEqual(result['test'], {'y': 20.0, 'x': 340, 'mark': 1})
        self.assertEqual(result['hr'], {'y': 180.0, 'x': 260, 'mark': 1})

        # Not sure what these temp nodes are for, but they are present in
        # result
        self.assertEqual(result[(3, 'temp')], {'y': 180, 'x': 260, 'mark': 0})
        self.assertEqual(result[(4, 'temp')], {'y': 180, 'x': 340, 'mark': 0})
        self.assertEqual(result[(2, 'temp')], {'y': 100, 'x': 180, 'mark': 0})

        # Test transitions
        # It seems that there are duplicates,
        # Not sure if it is correct
        # _logger.info("graph transitions: %r", g.transitions)
        self.assertEqual(g.transitions['profile'], ['mrp'])
        self.assertEqual(
            g.transitions['mrp'], ['project', (2, 'temp'), (2, 'temp')])
        self.assertEqual(
            g.transitions['project'], ['account', 'hr', (3, 'temp')])
        self.assertEqual(g.transitions['product'], ['base'])
        self.assertEqual(
            g.transitions['account'], ['product', 'test', (4, 'temp')])
        self.assertEqual(g.transitions['hr'], [(4, 'temp')])
        self.assertEqual(g.transitions['test'], ['base'])
        self.assertEqual(g.transitions[(3, 'temp')], ['product', 'test'])
        self.assertEqual(g.transitions[(4, 'temp')], ['base', 'base'])
        self.assertEqual(g.transitions[(2, 'temp')], ['hr', (3, 'temp')])
