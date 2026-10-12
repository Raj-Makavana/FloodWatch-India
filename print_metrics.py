import json

with open('models/model_evaluation_metrics.json', 'r') as f:
    metrics = json.load(f)

print(f"\n{'State / UT':<20} | {'Test Accuracy':<15} | {'Test Samples'}")
print("-" * 55)
for state, data in metrics['states'].items():
    if 'test_accuracy' in data:
        acc = data['test_accuracy'] * 100
        samples = data.get('test_samples', 'N/A')
        print(f"{state:<20} | {acc:6.2f}%         | {samples}")