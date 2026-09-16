import unittest

from backend.app.main import AskRequest, ask_klr, health, stats


class KLRApiTests(unittest.TestCase):
    def test_health_and_stats_snapshot(self):
        self.assertEqual(health()["status"], "ok")
        snapshot = stats()
        self.assertEqual(snapshot["coverage"]["innings"], 429)
        self.assertEqual(len(snapshot["centuries"]), 28)

    def test_grounded_ask_answers_and_declines(self):
        answer = ask_klr(AskRequest(question="How has KL Rahul performed against England?"))
        self.assertEqual(answer["status"], "answered")
        self.assertGreater(len(answer["evidence"]), 0)

        unsupported = ask_klr(AskRequest(question="What did he eat before the match?"))
        self.assertEqual(unsupported["status"], "unavailable")
        self.assertEqual(unsupported["evidence"], [])


if __name__ == "__main__":
    unittest.main()
