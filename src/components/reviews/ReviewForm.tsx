import React, { useState, useRef } from 'react';
import StarRating from '@/components/reviews/StarRating';
import { CameraIcon, XIcon, SendIcon } from '@/components/icons/Icons';
import { submitReview, uploadReviewPhoto, ReviewFormData } from '@/hooks/useReviews';

interface ReviewFormProps {
  propertyId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  propertyId,
  userId,
  userName,
  userAvatar,
  onSuccess,
  onCancel,
}) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 photos total
    const remaining = 5 - photoPreviews.length;
    const selected = files.slice(0, remaining);

    // Create previews
    selected.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setPhotoFiles(prev => [...prev, ...selected]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (reviewText.trim().length < 10) {
      setError('Please write at least 10 characters in your review');
      return;
    }

    setSubmitting(true);

    try {
      // Upload photos first
      let uploadedUrls: string[] = [];
      if (photoFiles.length > 0) {
        setUploadingPhotos(true);
        const uploadPromises = photoFiles.map(file =>
          uploadReviewPhoto(file, propertyId, userId)
        );
        const results = await Promise.all(uploadPromises);
        uploadedUrls = results
          .filter(r => r.url !== null)
          .map(r => r.url as string);
        setUploadingPhotos(false);
      }

      const formData: ReviewFormData = {
        rating,
        review_text: reviewText.trim(),
        photos: uploadedUrls,
      };

      const { error: submitError } = await submitReview(
        propertyId,
        userId,
        userName,
        userAvatar,
        formData
      );

      if (submitError) {
        setError(submitError);
        return;
      }

      // Reset form
      setRating(0);
      setReviewText('');
      setPhotos([]);
      setPhotoFiles([]);
      setPhotoPreviews([]);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5">
      <h4 className="font-semibold text-gray-900 mb-4 text-lg">Write a Review</h4>

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating
        </label>
        <StarRating
          rating={rating}
          interactive
          onChange={setRating}
          size={28}
          showLabel
        />
      </div>

      {/* Review Text */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience visiting this property. What did you like? What could be improved?"
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
          maxLength={2000}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">Min 10 characters</span>
          <span className={`text-xs ${reviewText.length > 1800 ? 'text-amber-500' : 'text-gray-400'}`}>
            {reviewText.length}/2000
          </span>
        </div>
      </div>

      {/* Photo Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos (optional)
        </label>
        <div className="flex flex-wrap gap-3">
          {photoPreviews.map((preview, index) => (
            <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XIcon size={10} />
              </button>
            </div>
          ))}
          {photoPreviews.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
            >
              <CameraIcon size={20} />
              <span className="text-[10px] font-medium">Add</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoSelect}
          className="hidden"
        />
        <p className="text-xs text-gray-400 mt-1">Up to 5 photos. Max 5MB each.</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {uploadingPhotos ? 'Uploading Photos...' : 'Submitting...'}
            </>
          ) : (
            <>
              <SendIcon size={16} />
              Submit Review
            </>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;
