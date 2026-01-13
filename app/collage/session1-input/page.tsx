'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Session1Input } from '@/types/collage';

const INTEREST_OPTIONS = [
  'Coding & Tech',
  'Art & Design',
  'Sports',
  'Music',
  'Science',
  'Writing',
  'Helping Others',
  'Building Things',
  'Leadership',
  'Gaming',
  'Animals',
  'Cooking',
];

const CAREER_CLUSTERS = [
  'STEM (Science, Technology, Engineering, Math)',
  'Arts, A/V Technology & Communications',
  'Human Services',
  'Business Management & Administration',
  'Health Science',
  'Education & Training',
];

export default function Session1InputPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Session1Input>({
    themes: ['', '', ''],
    interests: [],
    careerClusters: [],
    customInterests: [],
  });
  const [customInterest, setCustomInterest] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateTheme = (index: number, value: string) => {
    const newThemes = [...formData.themes];
    newThemes[index] = value;
    setFormData({ ...formData, themes: newThemes });
    if (errors.themes) setErrors({ ...errors, themes: '' });
  };

  const toggleInterest = (interest: string) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter((i) => i !== interest)
      : [...formData.interests, interest];
    setFormData({ ...formData, interests: newInterests });
    if (errors.interests) setErrors({ ...errors, interests: '' });
  };

  const toggleCareerCluster = (cluster: string) => {
    const newClusters = formData.careerClusters.includes(cluster)
      ? formData.careerClusters.filter((c) => c !== cluster)
      : [...formData.careerClusters, cluster];
    setFormData({ ...formData, careerClusters: newClusters });
    if (errors.careerClusters) setErrors({ ...errors, careerClusters: '' });
  };

  const addCustomInterest = () => {
    if (customInterest.trim()) {
      setFormData({
        ...formData,
        customInterests: [...(formData.customInterests || []), customInterest.trim()],
        interests: [...formData.interests, customInterest.trim()],
      });
      setCustomInterest('');
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const hasAllThemes = formData.themes.every((t) => t.trim() !== '');
    if (!hasAllThemes) {
      newErrors.themes = 'Please fill in all 3 interest themes';
    }

    if (formData.interests.length === 0) {
      newErrors.interests = 'Please select at least one interest';
    }

    if (formData.careerClusters.length === 0) {
      newErrors.careerClusters = 'Please select at least one career cluster';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      // Save to localStorage for now
      localStorage.setItem('session1Input', JSON.stringify(formData));
      router.push('/collage/template-selection');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <ProgressBar value={5} showLabel label="5%" />
        </div>

        {/* Header */}
        <Card className="mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📝 First, let's recall your Session 1 discoveries!
            </h1>
            <p className="text-gray-600">
              This helps us personalize your challenges.
            </p>
          </div>
        </Card>

        {/* Themes */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            ✨ Your Top 3 Interest Themes:
          </h2>
          <p className="text-gray-600 mb-4">
            What were your standout personality traits?
          </p>

          <div className="space-y-4">
            {[0, 1, 2].map((index) => (
              <div key={index}>
                <label htmlFor={`theme-${index}`} className="block text-sm font-semibold text-gray-700 mb-2">
                  Theme {index + 1}:
                </label>
                <Input
                  id={`theme-${index}`}
                  name={`theme-${index}`}
                  value={formData.themes[index]}
                  onChange={(e) => updateTheme(index, e.target.value)}
                  placeholder={
                    index === 0
                      ? 'Example: "Creative Problem-Solver"'
                      : index === 1
                      ? 'Example: "Helper & Connector"'
                      : 'Example: "Hands-On Builder"'
                  }
                />
              </div>
            ))}
          </div>
          {errors.themes && (
            <p className="text-red-500 text-sm mt-2">{errors.themes}</p>
          )}
        </Card>

        {/* Interests */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            💡 Your Top Interests:
          </h2>
          <p className="text-gray-600 mb-4">
            Check all that apply or add your own
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {INTEREST_OPTIONS.map((interest) => (
              <label
                key={interest}
                className="flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer hover:border-blue-primary transition-colors"
                style={{
                  borderColor: formData.interests.includes(interest)
                    ? '#3B82F6'
                    : '#E5E7EB',
                  backgroundColor: formData.interests.includes(interest)
                    ? '#EFF6FF'
                    : 'white',
                }}
              >
                <input
                  id={`interest-${interest.toLowerCase().replace(/\s+/g, '-')}`}
                  name={`interest-${interest.toLowerCase().replace(/\s+/g, '-')}`}
                  type="checkbox"
                  checked={formData.interests.includes(interest)}
                  onChange={() => toggleInterest(interest)}
                  className="rounded text-blue-primary"
                />
                <span className="text-sm font-medium">{interest}</span>
              </label>
            ))}
          </div>

          {formData.customInterests && formData.customInterests.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Your custom interests:
              </p>
              <div className="flex flex-wrap gap-2">
                {formData.customInterests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              id="custom-interest"
              name="custom-interest"
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              placeholder="Add more..."
              onKeyPress={(e) => e.key === 'Enter' && addCustomInterest()}
              aria-label="Add custom interest"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={addCustomInterest}
              className="whitespace-nowrap"
            >
              + Add
            </Button>
          </div>
          {errors.interests && (
            <p className="text-red-500 text-sm mt-2">{errors.interests}</p>
          )}
        </Card>

        {/* Career Clusters */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            🎯 Recommended Career Clusters:
          </h2>
          <p className="text-gray-600 mb-4">
            Which areas were suggested for you?
          </p>

          <div className="space-y-3">
            {CAREER_CLUSTERS.map((cluster) => (
              <label
                key={cluster}
                className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:border-blue-primary transition-colors"
                style={{
                  borderColor: formData.careerClusters.includes(cluster)
                    ? '#3B82F6'
                    : '#E5E7EB',
                  backgroundColor: formData.careerClusters.includes(cluster)
                    ? '#EFF6FF'
                    : 'white',
                }}
              >
                <input
                  id={`career-${cluster.toLowerCase().replace(/[\s,()&]+/g, '-')}`}
                  name={`career-${cluster.toLowerCase().replace(/[\s,()&]+/g, '-')}`}
                  type="checkbox"
                  checked={formData.careerClusters.includes(cluster)}
                  onChange={() => toggleCareerCluster(cluster)}
                  className="rounded text-blue-primary"
                />
                <span className="font-medium">{cluster}</span>
              </label>
            ))}
          </div>
          {errors.careerClusters && (
            <p className="text-red-500 text-sm mt-2">{errors.careerClusters}</p>
          )}
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => router.push('/')}>
            ← Back
          </Button>
          <Button variant="primary" onClick={handleContinue}>
            Continue →
          </Button>
        </div>
      </div>
    </div>
  );
}
